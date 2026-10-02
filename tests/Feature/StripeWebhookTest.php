<?php

namespace Tests\Feature;

use App\Mail\InvoicePaid;
use App\Mail\PaymentReceived;
use App\Models\Invoice;
use App\Models\InvoiceTransfer;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Stripe\Checkout\Session;
use Stripe\StripeClient;
use Tests\Fakes\FakeStripeClient;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['stripe.webhook.secret' => 'whsec_test', 'stripe.webhook.connect_secret' => null]);

    $this->stripe = new FakeStripeClient();
    $this->app->instance(StripeClient::class, $this->stripe);

    Mail::fake();
});

test('webhook rejects a request with an invalid signature', function () {
    [$invoice] = invoiceForWorkers([['acct_worker_1', 120.00]]);

    postStripeEvent($this, checkoutCompletedEvent($invoice), 'whsec_wrong')->assertStatus(400);

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PENDING);
    expect($this->stripe->transfersCreated)->toBeEmpty();
});

test('webhook rejects a request when no webhook secret is configured', function () {
    config(['stripe.webhook.secret' => null]);
    [$invoice] = invoiceForWorkers([['acct_worker_1', 120.00]]);

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(400);

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PENDING);
});

test('webhook accepts an event signed with the connect secret', function () {
    config(['stripe.webhook.connect_secret' => 'whsec_connect']);
    $worker = User::factory()->create(['role' => 'health_worker', 'stripe_account_id' => 'acct_worker_1']);

    postStripeEvent($this, [
        'id' => 'evt_test_2',
        'object' => 'event',
        'type' => 'account.updated',
        'account' => 'acct_worker_1',
        'data' => ['object' => [
            'id' => 'acct_worker_1',
            'object' => 'account',
            'details_submitted' => true,
            'charges_enabled' => true,
            'payouts_enabled' => true,
            'requirements' => ['currently_due' => [], 'disabled_reason' => null],
        ]],
    ], 'whsec_connect')->assertStatus(200);

    $worker->refresh();
    expect($worker->stripe_onboarding_complete)->toBeTrue();
    expect($worker->stripe_charges_enabled)->toBeTrue();
    expect($worker->stripe_payouts_enabled)->toBeTrue();
    expect($worker->stripe_connected_at)->not->toBeNull();
});

test('checkout completed marks the invoice paid and transfers each worker their share', function () {
    [$invoice, [$workerA, $workerB], $admin] = invoiceForWorkers([
        ['acct_worker_a', 120.00],
        ['acct_worker_b', 19.99],
    ]);

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);

    $invoice->refresh();
    expect($invoice->status)->toBe(Invoice::STATUS_PAID);
    expect($invoice->paid_at)->not->toBeNull();
    expect($invoice->stripe_payment_intent_id)->toBe('pi_test_1');
    expect($invoice->timesheets->pluck('status')->unique()->all())->toBe(['paid']);

    $transfers = collect($this->stripe->transfersCreated)->keyBy('params.destination');
    expect($transfers)->toHaveCount(2);
    expect($transfers['acct_worker_a']['params']['amount'])->toBe(12000);
    expect($transfers['acct_worker_b']['params']['amount'])->toBe(1999);
    expect($transfers['acct_worker_a']['params']['source_transaction'])->toBe('ch_test_1');
    expect($transfers['acct_worker_a']['opts']['idempotency_key'])->toBe("invoice-{$invoice->id}-worker-{$workerA->id}");

    $rows = $invoice->transfers->keyBy('worker_id');
    expect($rows[$workerA->id]->status)->toBe(InvoiceTransfer::STATUS_PAID);
    expect($rows[$workerA->id]->amount)->toBe('120.00');
    expect($rows[$workerB->id]->stripe_transfer_id)->not->toBeNull();
    expect($rows[$workerB->id]->paid_at)->not->toBeNull();

    expect(Notification::where('type', 'payment_received')->count())->toBe(2);
    Mail::assertSent(PaymentReceived::class, 2);
    Mail::assertSent(InvoicePaid::class, fn ($mail) => $mail->hasTo($admin->email));
});

test('the same event delivered twice does not pay workers twice', function () {
    [$invoice] = invoiceForWorkers([['acct_worker_a', 120.00]]);

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);
    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);

    expect($this->stripe->transfersCreated)->toHaveCount(1);
    expect(Notification::where('type', 'payment_received')->count())->toBe(1);
    Mail::assertSent(PaymentReceived::class, 1);
    Mail::assertSent(InvoicePaid::class, 1);
});

test('a failed transfer and a worker without stripe are recorded as owed', function () {
    [$invoice, [$failing, $unconnected, $ok]] = invoiceForWorkers([
        ['acct_failing', 50.00],
        [null, 60.00],
        ['acct_ok', 70.00],
    ]);
    $this->stripe->failDestinations = ['acct_failing'];

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);

    $transfers = $invoice->transfers->keyBy('worker_id');
    expect($transfers[$failing->id]->status)->toBe(InvoiceTransfer::STATUS_FAILED);
    expect($transfers[$failing->id]->reason)->toContain('cannot receive transfers');
    expect($transfers[$failing->id]->attempts)->toBe(1);
    expect($transfers[$unconnected->id]->status)->toBe(InvoiceTransfer::STATUS_HELD);
    expect($transfers[$unconnected->id]->amount)->toBe('60.00');
    expect($transfers[$ok->id]->status)->toBe(InvoiceTransfer::STATUS_PAID);
    expect(InvoiceTransfer::owed()->count())->toBe(2);

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PAID);
    expect($this->stripe->transfersCreated)->toHaveCount(1);
    expect(Notification::where('type', 'payment_received')->pluck('user_id')->all())->toBe([$ok->id]);
});

test('a worker whose stripe account is not ready has their payment held', function () {
    [$invoice, [$restricted, $ok]] = invoiceForWorkers([
        ['acct_restricted', 50.00],
        ['acct_ok', 70.00],
    ]);
    $this->stripe->accountOverrides['acct_restricted'] = ['details_submitted' => true, 'payouts_enabled' => false];

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);

    $transfers = $invoice->transfers->keyBy('worker_id');
    expect($transfers[$restricted->id]->status)->toBe(InvoiceTransfer::STATUS_HELD);
    expect($transfers[$restricted->id]->reason)->toContain('not ready');
    expect($transfers[$ok->id]->status)->toBe(InvoiceTransfer::STATUS_PAID);
    expect(Notification::where('type', 'payment_held')->pluck('user_id')->all())->toBe([$restricted->id]);

    expect(collect($this->stripe->transfersCreated)->pluck('params.destination')->all())->toBe(['acct_ok']);
    expect($restricted->fresh()->stripe_payouts_enabled)->toBeFalse();
});

test('an unpaid checkout session leaves the invoice untouched', function () {
    [$invoice] = invoiceForWorkers([['acct_worker_a', 120.00]]);

    postStripeEvent($this, checkoutCompletedEvent($invoice, ['payment_status' => 'unpaid']))->assertStatus(200);

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PENDING);
    expect($this->stripe->transfersCreated)->toBeEmpty();
});

test('events for other checkouts and unknown event types are acknowledged', function () {
    [$invoice] = invoiceForWorkers([['acct_worker_a', 120.00]]);

    postStripeEvent($this, checkoutCompletedEvent($invoice, ['metadata' => []]))->assertStatus(200);
    postStripeEvent($this, ['id' => 'evt_test_3', 'object' => 'event', 'type' => 'customer.created', 'data' => ['object' => ['id' => 'cus_1', 'object' => 'customer']]])->assertStatus(200);

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PENDING);
});

test('the success redirect after the webhook does not pay workers again', function () {
    [$invoice, , $admin] = invoiceForWorkers([['acct_worker_a', 120.00]]);
    $this->stripe->session = Session::constructFrom(checkoutSession($invoice));

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);

    $this->actingAs($admin)
        ->get(route('invoices.stripe-success', ['invoice' => $invoice->id, 'session_id' => 'cs_test_1']))
        ->assertRedirect(route('invoices.show', $invoice))
        ->assertSessionHas('success');

    expect($this->stripe->transfersCreated)->toHaveCount(1);
    expect(Notification::where('type', 'payment_received')->count())->toBe(1);
});

test('the success redirect alone completes the payment when no webhook arrives', function () {
    [$invoice, , $admin] = invoiceForWorkers([['acct_worker_a', 120.00]]);
    $this->stripe->session = Session::constructFrom(checkoutSession($invoice));

    $this->actingAs($admin)
        ->get(route('invoices.stripe-success', ['invoice' => $invoice->id, 'session_id' => 'cs_test_1']))
        ->assertSessionHas('success');

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PAID);
    expect($this->stripe->transfersCreated)->toHaveCount(1);
});

test('the success redirect rejects a session that belongs to another invoice', function () {
    [$invoice, , $admin] = invoiceForWorkers([['acct_worker_a', 120.00]]);
    $this->stripe->session = Session::constructFrom(checkoutSession($invoice, ['metadata' => ['invoice_id' => 'another-invoice']]));

    $this->actingAs($admin)
        ->get(route('invoices.stripe-success', ['invoice' => $invoice->id, 'session_id' => 'cs_test_1']))
        ->assertSessionHas('error', 'Invalid payment session');

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PENDING);
    expect($this->stripe->transfersCreated)->toBeEmpty();
});
