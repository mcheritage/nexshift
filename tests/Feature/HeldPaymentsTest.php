<?php

namespace Tests\Feature;

use App\Mail\PaymentReceived;
use App\Models\InvoiceTransfer;
use App\Models\Notification;
use App\Models\User;
use App\Services\InvoicePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Stripe\StripeClient;
use Tests\Fakes\FakeStripeClient;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['stripe.webhook.secret' => 'whsec_test', 'stripe.webhook.connect_secret' => null]);

    $this->stripe = new FakeStripeClient();
    $this->app->instance(StripeClient::class, $this->stripe);

    Mail::fake();
    $this->withoutVite();
});

function accountUpdatedEvent(string $accountId, bool $ready = true): array
{
    return [
        'id' => 'evt_account_1',
        'object' => 'event',
        'type' => 'account.updated',
        'account' => $accountId,
        'data' => ['object' => [
            'id' => $accountId,
            'object' => 'account',
            'details_submitted' => $ready,
            'charges_enabled' => $ready,
            'payouts_enabled' => $ready,
        ]],
    ];
}

/**
 * A Stripe-paid invoice where the one worker's payment is being held
 * because their Stripe account (acct_held) is not ready.
 */
function invoiceWithHeldPayment($test): array
{
    [$invoice, [$worker]] = invoiceForWorkers([['acct_held', 80.00]]);
    $test->stripe->accountOverrides['acct_held'] = ['payouts_enabled' => false];

    postStripeEvent($test, checkoutCompletedEvent($invoice))->assertStatus(200);
    expect(InvoiceTransfer::owed()->count())->toBe(1);

    return [$invoice, $worker];
}

test('a held payment is sent automatically when stripe reports the worker\'s account is ready', function () {
    [$invoice, $worker] = invoiceWithHeldPayment($this);
    $this->stripe->accountOverrides = [];

    postStripeEvent($this, accountUpdatedEvent('acct_held'))->assertStatus(200);

    $transfer = InvoiceTransfer::first();
    expect($transfer->status)->toBe(InvoiceTransfer::STATUS_PAID);
    expect($transfer->stripe_transfer_id)->not->toBeNull();
    expect($transfer->reason)->toBeNull();
    expect($this->stripe->transfersCreated)->toHaveCount(1);
    expect($this->stripe->transfersCreated[0]['params']['amount'])->toBe(8000);
    expect($this->stripe->transfersCreated[0]['params']['destination'])->toBe('acct_held');
    expect(Notification::where('type', 'payment_received')->where('user_id', $worker->id)->count())->toBe(1);
    Mail::assertSent(PaymentReceived::class, 1);
});

test('a held payment stays held while the worker\'s account is still not ready', function () {
    [$invoice, $worker] = invoiceWithHeldPayment($this);

    postStripeEvent($this, accountUpdatedEvent('acct_held', ready: false))->assertStatus(200);
    $this->artisan('stripe:pay-held-transfers')->assertSuccessful();

    expect(InvoiceTransfer::first()->status)->toBe(InvoiceTransfer::STATUS_HELD);
    expect($this->stripe->transfersCreated)->toBeEmpty();
    expect(Notification::where('type', 'payment_held')->count())->toBe(1);
});

test('a worker who connects stripe after the invoice was paid receives their held payment', function () {
    [$invoice, [$worker]] = invoiceForWorkers([[null, 45.50]]);
    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);
    expect(InvoiceTransfer::first()->status)->toBe(InvoiceTransfer::STATUS_HELD);

    $worker->update(['stripe_account_id' => 'acct_late']);
    postStripeEvent($this, accountUpdatedEvent('acct_late'))->assertStatus(200);

    expect(InvoiceTransfer::first()->status)->toBe(InvoiceTransfer::STATUS_PAID);
    expect($this->stripe->transfersCreated[0]['params']['amount'])->toBe(4550);
});

test('the scheduled command pays held payments and a paid one is never sent twice', function () {
    invoiceWithHeldPayment($this);
    $this->stripe->accountOverrides = [];

    $this->artisan('stripe:pay-held-transfers')->assertSuccessful();
    $this->artisan('stripe:pay-held-transfers')->assertSuccessful();
    postStripeEvent($this, accountUpdatedEvent('acct_held'))->assertStatus(200);

    expect(InvoiceTransfer::owed()->count())->toBe(0);
    expect($this->stripe->transfersCreated)->toHaveCount(1);
});

test('retrying a transfer stripe refused uses a new idempotency key', function () {
    [$invoice, [$worker]] = invoiceForWorkers([['acct_worker_a', 120.00]]);
    $this->stripe->failDestinations = ['acct_worker_a'];
    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);
    expect(InvoiceTransfer::first()->status)->toBe(InvoiceTransfer::STATUS_FAILED);

    $this->stripe->failDestinations = [];
    expect(app(InvoicePaymentService::class)->payOwedTransfers($worker))->toBe(1);

    expect(InvoiceTransfer::first()->status)->toBe(InvoiceTransfer::STATUS_PAID);
    expect($this->stripe->transfersCreated[0]['opts']['idempotency_key'])->toBe("invoice-{$invoice->id}-worker-{$worker->id}-retry-1");
});

test('an admin can see held payments and retry one', function () {
    [$invoice, $worker] = invoiceWithHeldPayment($this);
    $admin = User::factory()->admin()->create();
    $transfer = InvoiceTransfer::first();

    $this->actingAs($admin)->get(route('admin.held-payments.index'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/held-payments/index')
            ->has('transfers', 1)
            ->where('transfers.0.worker.id', $worker->id)
            ->where('transfers.0.invoice.invoice_number', $invoice->invoice_number)
            ->where('stats.count', 1)
            ->where('stats.total', 80)
            ->where('stats.workers', 1));

    // Still not ready: the retry reports why
    $this->actingAs($admin)->post(route('admin.held-payments.retry', $transfer))
        ->assertRedirect(route('admin.held-payments.index'))
        ->assertSessionHas('error');
    expect($transfer->fresh()->status)->toBe(InvoiceTransfer::STATUS_HELD);

    // Ready now: the retry sends it
    $this->stripe->accountOverrides = [];
    $this->actingAs($admin)->post(route('admin.held-payments.retry', $transfer))
        ->assertRedirect(route('admin.held-payments.index'))
        ->assertSessionHas('success');
    expect($transfer->fresh()->status)->toBe(InvoiceTransfer::STATUS_PAID);

    $this->actingAs($admin)->get(route('admin.held-payments.index'))
        ->assertInertia(fn ($page) => $page->has('transfers', 0)->where('stats.count', 0));
});

test('only admins can see or retry held payments', function () {
    [$invoice, $worker] = invoiceWithHeldPayment($this);
    $transfer = InvoiceTransfer::first();

    $this->actingAs($worker)->get(route('admin.held-payments.index'))->assertStatus(403);
    $this->actingAs($worker)->post(route('admin.held-payments.retry', $transfer))->assertStatus(403);

    expect($this->stripe->transfersCreated)->toBeEmpty();
});
