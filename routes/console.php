<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Safety net: held payments are normally paid as soon as Stripe reports the worker's account is ready
Schedule::command('stripe:pay-held-transfers')->hourly()->withoutOverlapping();
