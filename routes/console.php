<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('shifts:send-reminders')->everyFiveMinutes();
Schedule::command('compliance:expire-documents')->dailyAt('00:05');
Schedule::command('compliance:send-expiry-reminders')->dailyAt('08:00');

// Safety net: held payments are normally paid as soon as Stripe reports the worker's account is ready
Schedule::command('stripe:pay-held-transfers')->hourly()->withoutOverlapping();
