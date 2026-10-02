<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\StripeConnectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Stripe\StripeClient;
use Tests\Fakes\FakeStripeClient;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->stripe = new FakeStripeClient();
    $this->app->instance(StripeClient::class, $this->stripe);
    $this->service = app(StripeConnectService::class);
});

test('connecting creates a stripe account for a worker who has none', function () {
    $worker = User::factory()->create(['role' => 'health_worker']);

    $result = $this->service->createConnectAccount($worker);

    expect($result['already_exists'])->toBeFalse();
    expect($this->stripe->accountsCreated)->toHaveCount(1);
    expect($worker->fresh()->stripe_account_id)->toBe('acct_new_1');
});

test('connecting again before onboarding is finished reuses the same stripe account', function () {
    $worker = User::factory()->create(['role' => 'health_worker', 'stripe_account_id' => 'acct_unfinished']);
    $this->stripe->accountOverrides['acct_unfinished'] = ['details_submitted' => false, 'payouts_enabled' => false];

    $result = $this->service->createConnectAccount($worker);

    expect($result['already_exists'])->toBeTrue();
    expect($result['account_id'])->toBe('acct_unfinished');
    expect($this->stripe->accountsCreated)->toBeEmpty();
    expect($worker->fresh()->stripe_account_id)->toBe('acct_unfinished');
});

test('connecting replaces a stored stripe account that no longer exists', function () {
    $worker = User::factory()->create([
        'role' => 'health_worker',
        'stripe_account_id' => 'acct_gone',
        'stripe_onboarding_complete' => true,
        'stripe_payouts_enabled' => true,
    ]);
    $this->stripe->missingAccounts = ['acct_gone'];

    $result = $this->service->createConnectAccount($worker);

    $worker->refresh();
    expect($result['already_exists'])->toBeFalse();
    expect($worker->stripe_account_id)->toBe('acct_new_1');
    expect($worker->stripe_onboarding_complete)->toBeFalse();
    expect($worker->stripe_payouts_enabled)->toBeFalse();
});

test('account balance is requested for the worker\'s connected account', function () {
    $worker = User::factory()->create(['role' => 'health_worker', 'stripe_account_id' => 'acct_worker_1']);

    $balance = $this->service->getAccountBalance($worker);

    expect($this->stripe->balanceCalls)->toHaveCount(1);
    expect($this->stripe->balanceCalls[0]['params'])->toBe([]);
    expect($this->stripe->balanceCalls[0]['opts'])->toBe(['stripe_account' => 'acct_worker_1']);
    expect($balance['available'][0]->amount)->toBe(1500);
});

test('disconnecting keeps the stripe account so reconnecting resumes it', function () {
    $worker = User::factory()->create([
        'role' => 'health_worker',
        'stripe_account_id' => 'acct_worker_1',
        'stripe_onboarding_complete' => true,
        'stripe_charges_enabled' => true,
        'stripe_payouts_enabled' => true,
    ]);

    $this->service->disconnectAccount($worker);

    $worker->refresh();
    expect($worker->stripe_account_id)->toBeNull();
    expect($worker->stripe_disconnected_account_id)->toBe('acct_worker_1');
    expect($worker->canReceivePayments())->toBeFalse();

    $result = $this->service->createConnectAccount($worker);
    $this->service->updateAccountStatus($worker);

    $worker->refresh();
    expect($result['already_exists'])->toBeTrue();
    expect($this->stripe->accountsCreated)->toBeEmpty();
    expect($worker->stripe_account_id)->toBe('acct_worker_1');
    expect($worker->stripe_disconnected_account_id)->toBeNull();
    expect($worker->canReceivePayments())->toBeTrue();
});

test('the connect route brings a disconnected worker\'s account back without new onboarding', function () {
    $worker = User::factory()->create([
        'role' => 'health_worker',
        'stripe_disconnected_account_id' => 'acct_worker_1',
    ]);

    $this->actingAs($worker)->getJson(route('worker.stripe.connect'))
        ->assertOk()
        ->assertJson(['success' => false, 'message' => 'Your Stripe account is already set up!']);

    expect($worker->fresh()->stripe_account_id)->toBe('acct_worker_1');
    expect($worker->fresh()->canReceivePayments())->toBeTrue();
    expect($this->stripe->accountsCreated)->toBeEmpty();
});

test('workers have no route to disconnect their stripe account', function () {
    expect(\Illuminate\Support\Facades\Route::has('worker.stripe.disconnect'))->toBeFalse();
});
