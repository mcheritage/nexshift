<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\CareHome;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function shiftAccessWorker(bool $paymentReady): User
{
    return User::factory()->create([
        'role' => 'health_worker',
        'status' => 'approved',
        'stripe_account_id' => $paymentReady ? 'acct_worker_1' : null,
        'stripe_onboarding_complete' => $paymentReady,
        'stripe_charges_enabled' => $paymentReady,
        'stripe_payouts_enabled' => $paymentReady,
    ]);
}

function publishedShift(): Shift
{
    $careHome = CareHome::create(['name' => 'Sunrise Care Home', 'status' => 'approved']);
    $admin = User::factory()->create(['care_home_id' => $careHome->id, 'role' => 'care_home_admin']);

    return Shift::create([
        'care_home_id' => $careHome->id,
        'title' => 'Day shift',
        'role' => Shift::ROLE_HEALTHCARE_ASSISTANT,
        'start_datetime' => now()->addDays(2),
        'end_datetime' => now()->addDays(2)->addHours(8),
        'duration_hours' => 8,
        'hourly_rate' => 15,
        'status' => Shift::STATUS_PUBLISHED,
        'published_at' => now(),
        'created_by' => $admin->id,
    ]);
}

test('a worker who is ready to receive payments sees shifts on the dashboard and shifts page', function () {
    publishedShift();
    $worker = shiftAccessWorker(paymentReady: true);

    $this->actingAs($worker)->get(route('worker.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('availableShifts', 1)
            ->where('stats.available_shifts', 1)
            ->where('stripeConnected', true));

    $this->actingAs($worker)->get(route('worker.shifts'))
        ->assertInertia(fn ($page) => $page
            ->has('shifts.data', 1)
            ->where('canReceivePayments', true));
});

test('a worker without a ready stripe account sees no shifts on the dashboard or shifts page', function () {
    publishedShift();
    $worker = shiftAccessWorker(paymentReady: false);

    $this->actingAs($worker)->get(route('worker.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('availableShifts', 0)
            ->where('stats.available_shifts', 0)
            ->where('stripeConnected', false));

    $this->actingAs($worker)->get(route('worker.shifts'))
        ->assertInertia(fn ($page) => $page
            ->has('shifts.data', 0)
            ->where('canReceivePayments', false));
});

test('a worker whose stripe account exists but is not ready is treated as not ready', function () {
    publishedShift();
    $worker = shiftAccessWorker(paymentReady: true);
    $worker->update(['stripe_payouts_enabled' => false]);

    $this->actingAs($worker)->get(route('worker.shifts'))
        ->assertInertia(fn ($page) => $page->has('shifts.data', 0));
});

test('a worker without a ready stripe account cannot apply for a shift', function () {
    $shift = publishedShift();
    $worker = shiftAccessWorker(paymentReady: false);

    $this->actingAs($worker)->post(route('worker.apply', $shift))->assertSessionHasErrors('error');

    expect(Application::count())->toBe(0);
});

test('a worker who is ready to receive payments can apply for a shift', function () {
    $shift = publishedShift();
    $worker = shiftAccessWorker(paymentReady: true);

    $this->actingAs($worker)->post(route('worker.apply', $shift))->assertSessionHasNoErrors();

    expect(Application::where('worker_id', $worker->id)->count())->toBe(1);
});

test('a worker without a ready stripe account cannot accept an assigned shift', function () {
    $shift = publishedShift();
    $worker = shiftAccessWorker(paymentReady: false);
    $application = Application::create([
        'shift_id' => $shift->id,
        'worker_id' => $worker->id,
        'status' => Application::STATUS_ASSIGNED,
        'applied_at' => now(),
    ]);

    $this->actingAs($worker)->patch(route('worker.assignments.accept', $application))->assertSessionHasErrors('error');

    expect($application->fresh()->status)->toBe(Application::STATUS_ASSIGNED);
});

test('the mobile api refuses shifts and applications for a worker without a ready stripe account', function () {
    $shift = publishedShift();
    $worker = shiftAccessWorker(paymentReady: false);

    $this->actingAs($worker, 'sanctum')->getJson('/api/v1/shifts')
        ->assertStatus(403)
        ->assertJsonPath('stripe_status', 'not_connected');
    $this->actingAs($worker, 'sanctum')->getJson("/api/v1/shifts/{$shift->id}")->assertStatus(403);
    $this->actingAs($worker, 'sanctum')->postJson('/api/v1/applications', ['shift_id' => $shift->id])->assertStatus(403);

    expect(Application::count())->toBe(0);
});

test('the mobile api lists shifts and accepts applications for a worker who is ready to receive payments', function () {
    $shift = publishedShift();
    $worker = shiftAccessWorker(paymentReady: true);

    $this->actingAs($worker, 'sanctum')->getJson('/api/v1/shifts')->assertOk()->assertJsonCount(1, 'data');
    $this->actingAs($worker, 'sanctum')->getJson("/api/v1/shifts/{$shift->id}")->assertOk();
    $this->actingAs($worker, 'sanctum')->postJson('/api/v1/applications', ['shift_id' => $shift->id])->assertSuccessful();

    expect(Application::where('worker_id', $worker->id)->count())->toBe(1);
});
