<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Shift;

$shifts = Shift::whereNull('total_pay')
    ->orWhere('total_pay', 0)
    ->get();

foreach ($shifts as $shift) {
    $shift->total_pay = $shift->duration_hours * $shift->hourly_rate;
    $shift->save();
}

echo "Updated {$shifts->count()} shifts with total_pay\n";
