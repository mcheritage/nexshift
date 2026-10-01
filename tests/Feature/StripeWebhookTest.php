<?php

namespace Tests\Feature;

use App\Mail\InvoicePaid;
use App\Mail\PaymentReceived;
use App\Models\CareHome;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Shift;
use App\Models\Timesheet;
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

function postStripeEvent($test, array $event, string $secret = 'whsec_test')
{
    $payload = json_encode($event);
    $timestamp = time();
    $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);

    return $test->call('POST', '/stripe/webhook', [], [], [], [
        'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
        'CONTENT_TYPE' => 'application/json',
    ], $payload);
}

function checkoutSession(Invoice $invoice, array $overrides = []): array
{
    return array_merge([
        'id' => 'cs_test_1',
        'object' => 'checkout.session',
        'payment_status' => 'paid',
        'payment_intent' => 'pi_test_1',
        'metadata' => ['invoice_id' => $invoice->id],
    ], $overrides);
}

function checkoutCompletedEvent(Invoice $invoice, array $overrides = []): array
{
    return [
        'id' => 'evt_test_1',
        'object' => 'event',
        'type' => 'checkout.session.completed',
        'data' => ['object' => checkoutSession($invoice, $overrides)],
    ];
}

/**
 * An unpaid invoice with one approved timesheet per worker.
 * $workers is a list of [stripe_account_id|null, total_pay].
 */
function invoiceForWorkers(array $workers): array
{
    $careHome = CareHome::create(['name' => 'Sunrise Care Home']);
    $admin = User::factory()->create(['care_home_id' => $careHome->id, 'role' => 'care_home_admin']);

    $users = [];
    $timesheetIds = [];
    $total = 0;

    foreach ($workers as [$stripeAccountId, $pay]) {
        $worker = User::factory()->create([
            'role' => 'health_worker',
            'stripe_account_id' => $stripeAccountId,
        ]);

        $shift = Shift::create([
            'care_home_id' => $careHome->id,
            'title' => 'Day shift',
            'role' => Shift::ROLE_HEALTHCARE_ASSISTANT,
            'start_datetime' => now()->subDay(),
            'end_datetime' => now()->subDay()->addHours(8),
            'duration_hours' => 8,
            'hourly_rate' => 15,
            'status' => Shift::STATUS_COMPLETED,
            'created_by' => $admin->id,
        ]);

        $timesheetIds[] = Timesheet::create([
            'shift_id' => $shift->id,
            'worker_id' => $worker->id,
            'care_home_id' => $careHome->id,
            'clock_in_time' => now()->subDay(),
            'clock_out_time' => now()->subDay()->addHours(8),
            'total_hours' => 8,
            'hourly_rate' => 15,
            'total_pay' => $pay,
            'status' => Timesheet::STATUS_APPROVED,
        ])->id;

        $users[] = $worker;
        $total += $pay;
    }

    $invoice = Invoice::create([
        'care_home_id' => $careHome->id,
        'invoice_number' => 'INV-TEST-001',
        'invoice_date' => now(),
        'period_start' => now()->subDay(),
        'period_end' => now(),
        'subtotal' => $total,
        'total' => $total,
        'status' => Invoice::STATUS_PENDING,
    ]);
    $invoice->timesheets()->attach($timesheetIds);

    return [$invoice, $users, $admin];
}

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

    expect($invoice->payment_metadata['transfers'][$workerA->id]['status'])->toBe('paid');
    expect($invoice->payment_metadata['transfers'][$workerB->id]['transfer_id'])->not->toBeNull();

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

test('a failed transfer and a worker without stripe are recorded on the invoice', function () {
    [$invoice, [$failing, $unconnected, $ok]] = invoiceForWorkers([
        ['acct_failing', 50.00],
        [null, 60.00],
        ['acct_ok', 70.00],
    ]);
    $this->stripe->failDestinations = ['acct_failing'];

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);

    $transfers = $invoice->fresh()->payment_metadata['transfers'];
    expect($transfers[$failing->id]['status'])->toBe('failed');
    expect($transfers[$failing->id]['error'])->toContain('cannot receive transfers');
    expect($transfers[$unconnected->id]['status'])->toBe('skipped');
    expect($transfers[$ok->id]['status'])->toBe('paid');

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PAID);
    expect($this->stripe->transfersCreated)->toHaveCount(1);
    expect(Notification::where('type', 'payment_received')->pluck('user_id')->all())->toBe([$ok->id]);
});

test('a worker whose stripe account is not ready is skipped instead of transferred to', function () {
    [$invoice, [$restricted, $ok]] = invoiceForWorkers([
        ['acct_restricted', 50.00],
        ['acct_ok', 70.00],
    ]);
    $this->stripe->accountOverrides['acct_restricted'] = ['details_submitted' => true, 'payouts_enabled' => false];

    postStripeEvent($this, checkoutCompletedEvent($invoice))->assertStatus(200);

    $transfers = $invoice->fresh()->payment_metadata['transfers'];
    expect($transfers[$restricted->id]['status'])->toBe('skipped');
    expect($transfers[$restricted->id]['error'])->toContain('not ready');
    expect($transfers[$ok->id]['status'])->toBe('paid');

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
