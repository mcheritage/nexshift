<?php

namespace App\Services;

use App\Mail\InvoicePaid;
use App\Mail\PaymentReceived;
use App\Models\Invoice;
use App\Models\InvoiceTransfer;
use App\Models\Notification;
use App\Models\User;
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
            $invoice = $this->lockInvoice($invoice->id);

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

                if ($invoice->careHome->user?->email) {
                    $emails[] = [$invoice->careHome->user->email, new InvoicePaid($invoice)];
                }
            }

            $this->transferToWorkers($invoice, $emails);
        });

        $this->sendEmails($invoice, $emails);
    }

    /**
     * Try again to pay every transfer a worker is still owed, e.g. once
     * their Stripe account becomes ready.
     *
     * @param User $worker
     * @return int Number of transfers that were paid
     */
    public function payOwedTransfers(User $worker): int
    {
        $owed = InvoiceTransfer::owed()->where('worker_id', $worker->id);
        $owedBefore = (clone $owed)->count();

        foreach ((clone $owed)->pluck('invoice_id') as $invoiceId) {
            $this->retryInvoiceForWorker($invoiceId, $worker->id);
        }

        return $owedBefore - (clone $owed)->count();
    }

    /**
     * Try again to pay a single held or failed transfer
     *
     * @param InvoiceTransfer $transfer
     * @return InvoiceTransfer The transfer with its new status
     */
    public function retryTransfer(InvoiceTransfer $transfer): InvoiceTransfer
    {
        if (!$transfer->isPaid()) {
            $this->retryInvoiceForWorker($transfer->invoice_id, $transfer->worker_id);
        }

        return $transfer->fresh();
    }

    protected function retryInvoiceForWorker(string $invoiceId, string $workerId): void
    {
        $emails = [];

        $invoice = DB::transaction(function () use ($invoiceId, $workerId, &$emails) {
            $invoice = $this->lockInvoice($invoiceId);

            $this->transferToWorkers($invoice, $emails, $workerId);

            return $invoice;
        });

        $this->sendEmails($invoice, $emails);
    }

    /**
     * Lock the invoice so the webhook, the redirect and retries can't process it together
     */
    protected function lockInvoice(string $invoiceId): Invoice
    {
        $invoice = Invoice::whereKey($invoiceId)->lockForUpdate()->firstOrFail();
        $invoice->load(['timesheets.worker', 'careHome.user']);

        return $invoice;
    }

    /**
     * Send each worker on a Stripe-paid invoice their share, unless it has
     * already been sent. A worker who can't be paid yet has their share
     * held, to be paid by a later call.
     *
     * Must be called inside a transaction holding the invoice lock.
     */
    protected function transferToWorkers(Invoice $invoice, array &$emails, ?string $onlyWorkerId = null): void
    {
        if ($invoice->status !== Invoice::STATUS_PAID || !$invoice->stripe_payment_intent_id) {
            return;
        }

        // Transfers are tied to the charge, which lets them go out while the balance is pending
        $paymentIntent = $this->stripe->paymentIntents->retrieve($invoice->stripe_payment_intent_id);

        if (!$paymentIntent->latest_charge) {
            throw new \Exception('No charge found in PaymentIntent ' . $paymentIntent->id);
        }

        $careHome = $invoice->careHome;

        foreach ($invoice->timesheets->groupBy('worker_id') as $workerId => $timesheets) {
            if ($onlyWorkerId && $workerId !== $onlyWorkerId) {
                continue;
            }

            $transfer = InvoiceTransfer::firstOrNew([
                'invoice_id' => $invoice->id,
                'worker_id' => $workerId,
            ]);

            if ($transfer->isPaid()) {
                continue;
            }

            $worker = $timesheets->first()->worker;
            $amount = (float) $timesheets->sum('total_pay');
            $transfer->amount = $amount;

            if (!$worker->stripe_account_id) {
                $this->holdTransfer($transfer, $invoice, 'Worker has no Stripe account');
                continue;
            }

            // Check with Stripe that the account can be paid right now
            try {
                $this->stripeService->updateAccountStatus($worker);
            } catch (ApiErrorException $e) {
                $this->holdTransfer($transfer, $invoice, 'Could not check the worker\'s Stripe account: ' . $e->getMessage());
                continue;
            }

            if (!$worker->canReceivePayments()) {
                $this->holdTransfer($transfer, $invoice, 'Worker\'s Stripe account is not ready to receive payments');
                continue;
            }

            try {
                $stripeTransfer = $this->stripe->transfers->create([
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
                    // Stripe returns the original transfer if the same attempt is ever sent twice.
                    // The key only changes after Stripe has refused an attempt.
                    'idempotency_key' => "invoice-{$invoice->id}-worker-{$workerId}"
                        . ($transfer->attempts > 0 ? "-retry-{$transfer->attempts}" : ''),
                ]);
            } catch (ApiErrorException $e) {
                $transfer->fill([
                    'status' => InvoiceTransfer::STATUS_FAILED,
                    'reason' => $e->getMessage(),
                    'attempts' => $transfer->attempts + 1,
                ])->save();

                Log::error('Stripe transfer failed', [
                    'invoice_id' => $invoice->id,
                    'worker_id' => $workerId,
                    'amount' => $amount,
                    'error' => $e->getMessage(),
                ]);

                continue;
            }

            $transfer->fill([
                'status' => InvoiceTransfer::STATUS_PAID,
                'reason' => null,
                'stripe_transfer_id' => $stripeTransfer->id,
                'paid_at' => now(),
            ])->save();

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
                    'transfer_id' => $stripeTransfer->id,
                ],
            ]);

            $emails[] = [$worker->email, new PaymentReceived($amount, $invoice, $careHome->name)];

            Log::info('Stripe transfer created successfully', [
                'transfer_id' => $stripeTransfer->id,
                'invoice_id' => $invoice->id,
                'worker_id' => $workerId,
                'amount' => $amount,
            ]);
        }
    }

    /**
     * Hold a worker's share until their Stripe account can receive it.
     * The worker is told once, the first time it is held.
     */
    protected function holdTransfer(InvoiceTransfer $transfer, Invoice $invoice, string $reason): void
    {
        $firstTime = !$transfer->exists;

        $transfer->fill([
            'status' => InvoiceTransfer::STATUS_HELD,
            'reason' => $reason,
        ])->save();

        Log::warning('Worker payment held', [
            'invoice_id' => $invoice->id,
            'worker_id' => $transfer->worker_id,
            'amount' => $transfer->amount,
            'reason' => $reason,
        ]);

        if (!$firstTime) {
            return;
        }

        Notification::create([
            'user_id' => $transfer->worker_id,
            'type' => 'payment_held',
            'title' => 'Payment On Hold',
            'message' => "Your payment of £" . number_format((float) $transfer->amount, 2) . " from {$invoice->careHome->name} for invoice {$invoice->invoice_number} is on hold. Finish setting up your Stripe account to receive it.",
            'data' => [
                'amount' => (float) $transfer->amount,
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'care_home_name' => $invoice->careHome->name,
            ],
        ]);
    }

    /**
     * Emails go out after the payment is saved, and a mail failure must not undo it
     */
    protected function sendEmails(Invoice $invoice, array $emails): void
    {
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
