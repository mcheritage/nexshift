<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\User;
use App\Services\InvoicePaymentService;
use App\Services\StripeConnectService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Stripe\Account;
use Stripe\Checkout\Session;
use Stripe\Event;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    protected InvoicePaymentService $paymentService;
    protected StripeConnectService $stripeService;

    public function __construct(InvoicePaymentService $paymentService, StripeConnectService $stripeService)
    {
        $this->paymentService = $paymentService;
        $this->stripeService = $stripeService;
    }

    /**
     * Receive an event from Stripe
     *
     * Any exception while handling an event returns a 500, which makes
     * Stripe deliver the event again later.
     */
    public function handle(Request $request): Response
    {
        $event = $this->verifiedEvent($request);

        if (!$event) {
            return response('Invalid signature', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                $this->handleCheckoutSession($event->data->object);
                break;

            case 'account.updated':
                $this->handleAccountUpdated($event->data->object);
                break;
        }

        return response('OK', 200);
    }

    /**
     * Build the event from the request, checking it was signed by Stripe
     */
    protected function verifiedEvent(Request $request): ?Event
    {
        $secrets = array_filter([
            config('stripe.webhook.secret'),
            config('stripe.webhook.connect_secret'),
        ]);

        if (empty($secrets)) {
            Log::error('Stripe webhook received but no webhook secret is configured');

            return null;
        }

        foreach ($secrets as $secret) {
            try {
                return Webhook::constructEvent(
                    $request->getContent(),
                    (string) $request->header('Stripe-Signature'),
                    $secret,
                    (int) config('stripe.webhook.tolerance', 300)
                );
            } catch (SignatureVerificationException $e) {
                continue;
            } catch (\UnexpectedValueException $e) {
                break;
            }
        }

        Log::warning('Stripe webhook rejected: signature could not be verified');

        return null;
    }

    /**
     * A care home has completed Checkout for an invoice
     */
    protected function handleCheckoutSession(Session $session): void
    {
        if ($session->payment_status !== 'paid') {
            return;
        }

        $invoiceId = $session->metadata->invoice_id ?? null;

        if (!$invoiceId) {
            return;
        }

        $invoice = Invoice::find($invoiceId);

        if (!$invoice) {
            Log::warning('Stripe checkout completed for an unknown invoice', [
                'invoice_id' => $invoiceId,
                'session_id' => $session->id,
            ]);

            return;
        }

        $this->paymentService->completeStripePayment($invoice, $session);
    }

    /**
     * A worker's connected account has changed (e.g. onboarding or verification)
     */
    protected function handleAccountUpdated(Account $account): void
    {
        $user = User::where('stripe_account_id', $account->id)->first();

        if (!$user) {
            return;
        }

        $this->stripeService->syncAccountStatus($user, $account);

        // Pay anything that was held while the worker's account wasn't ready
        if ($user->canReceivePayments()) {
            $this->paymentService->payOwedTransfers($user);
        }
    }
}
