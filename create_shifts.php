<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\CareHome;
use App\Models\Shift;
use Carbon\Carbon;

$careHomeId = '0199d285-6dfb-71bd-bd2d-a688ba8f8f28';
$careHome = CareHome::find($careHomeId);

$roles = ['healthcare_assistant', 'support_worker', 'registered_nurse', 'senior_care_worker', 'night_shift_worker'];
$titles = ['Morning HCA Shift', 'Night Support Worker', 'Day Registered Nurse', 'Senior Care Evening', 'Night Shift Worker'];

for ($i = 0; $i < 5; $i++) {
    $date = Carbon::now()->addDays($i + 1);
    
    Shift::create([
        'care_home_id' => $careHomeId,
        'title' => $titles[$i],
        'role' => $roles[$i],
        'shift_date' => $date->format('Y-m-d'),
        'start_datetime' => $date->copy()->setHour(9)->setMinute(0)->setSecond(0),
        'end_datetime' => $date->copy()->setHour(17)->setMinute(0)->setSecond(0),
        'duration_hours' => 8,
        'hourly_rate' => 15 + $i,
        'total_positions' => 2,
        'filled_positions' => 0,
        'requirements' => 'Valid certification and experience required for ' . $titles[$i],
        'status' => 'published',
        'location' => $careHome->name,
        'created_by' => '0199d285-6f3b-7044-973e-dec997a87777', // admin@sunshinecare.com
    ]);
}

echo "5 shifts created successfully!\n";
