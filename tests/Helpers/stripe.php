<?php

use App\Models\CareHome;
use App\Models\Invoice;
use App\Models\Shift;
use App\Models\Timesheet;
use App\Models\User;

/*
 * Helpers shared by the Stripe payment tests.
 */

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
