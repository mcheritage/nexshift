<?php

namespace App\Services;

use App\Mail\InvoicePaid;
use App\Mail\PaymentReceived;
use App\Models\Invoice;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class InvoicePaymentService
{
    protected StripeClient $stripe;
    protected StripeConnectService $stripeService;

    public function __construct(StripeClient $stripe, StripeConnectService $stripeService)
    {
        $this->stripe = $stripe;
        $this->stripeService = $stripeService;
    }

    /**
     * Mark an invoice as paid from a paid Checkout session and transfer
     * each worker's share to their Stripe account.
     *
     * Called by both the Stripe webhook and the checkout success redirect,
     * so it is safe to run more than once for the same payment.
     *
     * @param Invoice $invoice
     * @param Session $session
     * @return void
     */
    public function completeStripePayment(Invoice $invoice, Session $session): void
    {
        $emails = [];

        DB::transaction(function () use ($invoice, $session, &$emails) {
            // Lock the invoice so the webhook and the redirect can't process it together
            $invoice = Invoice::whereKey($invoice->id)->lockForUpdate()->firstOrFail();
            $invoice->load(['timesheets.worker', 'careHome.user']);
            $careHome = $invoice->careHome;

            if ($invoice->status === Invoice::STATUS_PAID) {
                if ($invoice->stripe_payment_intent_id !== $session->payment_intent) {
                    Log::warning('Stripe payment received for an invoice that was already paid another way', [
                        'invoice_id' => $invoice->id,
                        'session_id' => $session->id,
                        'payment_intent' => $session->payment_intent,
                    ]);

                    return;
                }
            } else {
                $invoice->update([
                    'status' => Invoice::STATUS_PAID,
                    'paid_at' => now(),
                    'stripe_session_id' => $session->id,
                    'stripe_payment_intent_id' => $session->payment_intent,
                ]);

                // Mark all timesheets as paid
                $invoice->timesheets()->update(['status' => 'paid']);

                foreach ($invoice->timesheets as $timesheet) {
                    $timesheet->logStatusChange('paid', null, "Paid via invoice {$invoice->invoice_number}");
                }

                if ($careHome->user?->email) {
                    $emails[] = [$careHome->user->email, new InvoicePaid($invoice)];
                }
            }

            // Transfers are tied to the charge, which lets them go out while the balance is pending
            $paymentIntent = $this->stripe->paymentIntents->retrieve($session->payment_intent);

            if (!$paymentIntent->latest_charge) {
                throw new \Exception('No charge found in PaymentIntent ' . $paymentIntent->id);
            }

            $metadata = $invoice->payment_metadata ?? [];
            $transfers = $metadata['transfers'] ?? [];

            foreach ($invoice->timesheets->groupBy('worker_id') as $workerId => $timesheets) {
                if (($transfers[$workerId]['status'] ?? null) === 'paid') {
                    continue;
                }

                $worker = $timesheets->first()->worker;
                $amount = (float) $timesheets->sum('total_pay');

                $record = [
                    'amount' => $amount,
                    'updated_at' => now()->toIso8601String(),
                ];

                if (!$worker->stripe_account_id) {
                    $transfers[$workerId] = $record + [
                        'status' => 'skipped',
                        'error' => 'Worker has no Stripe account',
                    ];

                    Log::warning('Worker not paid: no Stripe account', [
                        'invoice_id' => $invoice->id,
                        'worker_id' => $workerId,
                        'amount' => $amount,
                    ]);

                    continue;
                }

                try {
                    // Check with Stripe that the account can be paid right now
                    $this->stripeService->updateAccountStatus($worker);

                    if (!$worker->canReceivePayments()) {
                        $transfers[$workerId] = $record + [
                            'status' => 'skipped',
                            'error' => 'Worker\'s Stripe account is not ready to receive payments',
                        ];

                        Log::warning('Worker not paid: Stripe account not ready to receive payments', [
                            'invoice_id' => $invoice->id,
                            'worker_id' => $workerId,
                            'amount' => $amount,
                        ]);

                        continue;
                    }

                    $transfer = $this->stripe->transfers->create([
                        'amount' => (int) round($amount * 100),
                        'currency' => 'gbp',
                        'destination' => $worker->stripe_account_id,
                        'source_transaction' => $paymentIntent->latest_charge,
                        'description' => "Payment for invoice {$invoice->invoice_number}",
                        'metadata' => [
                            'invoice_id' => $invoice->id,
                            'worker_id' => $workerId,
                        ],
                    ], [
                        // Stripe returns the original transfer if this is ever sent twice
                        'idempotency_key' => "invoice-{$invoice->id}-worker-{$workerId}",
                    ]);
                } catch (ApiErrorException $e) {
                    $transfers[$workerId] = $record + [
                        'status' => 'failed',
                        'error' => $e->getMessage(),
                    ];

                    Log::error('Stripe transfer failed', [
                        'invoice_id' => $invoice->id,
                        'worker_id' => $workerId,
                        'amount' => $amount,
                        'error' => $e->getMessage(),
                    ]);

                    continue;
                }

                $transfers[$workerId] = $record + [
                    'status' => 'paid',
                    'transfer_id' => $transfer->id,
                ];

                Notification::create([
                    'user_id' => $workerId,
                    'type' => 'payment_received',
                    'title' => 'Payment Received',
                    'message' => "You have received a payment of £" . number_format($amount, 2) . " from {$careHome->name} for invoice {$invoice->invoice_number}.",
                    'data' => [
                        'amount' => $amount,
                        'invoice_id' => $invoice->id,
                        'invoice_number' => $invoice->invoice_number,
                        'care_home_name' => $careHome->name,
                        'transfer_id' => $transfer->id,
                    ],
                ]);

                $emails[] = [$worker->email, new PaymentReceived($amount, $invoice, $careHome->name)];

                Log::info('Stripe transfer created successfully', [
                    'transfer_id' => $transfer->id,
                    'invoice_id' => $invoice->id,
                    'worker_id' => $workerId,
                    'amount' => $amount,
                ]);
            }

            $metadata['transfers'] = $transfers;
            $invoice->update(['payment_metadata' => $metadata]);
        });

        // Emails go out after the payment is saved, and a mail failure must not undo it
        foreach ($emails as [$address, $mailable]) {
            try {
                Mail::to($address)->send($mailable);
            } catch (\Exception $e) {
                Log::error('Failed to send payment email', [
                    'invoice_id' => $invoice->id,
                    'mailable' => get_class($mailable),
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
