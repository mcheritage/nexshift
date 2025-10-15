<?php

namespace Database\Seeders;

use App\Models\Timesheet;
use App\Models\User;
use App\Models\Shift;
use App\Models\CareHome;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TimesheetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the Sunshine Care Home
        $careHome = CareHome::where('name', 'Sunshine Care Home')->first();
        if (!$careHome) {
            $this->command->warn('Sunshine Care Home not found. Please run CareHomeSeeder first.');
            return;
        }

        // Get some healthcare workers
        $workers = User::where('role', 'health_care_worker')->limit(5)->get();
        if ($workers->isEmpty()) {
            $this->command->warn('No healthcare workers found. Please run HealthCareWorkerProfileSeeder first.');
            return;
        }

        // Get some shifts for the care home
        $shifts = Shift::where('care_home_id', $careHome->id)
            ->where('shift_date', '>=', now()->subDays(30))
            ->where('shift_date', '<=', now()->addDays(7))
            ->limit(10)
            ->get();

        if ($shifts->isEmpty()) {
            $this->command->warn('No shifts found for the care home. Creating sample shifts...');
            
            // Create some sample shifts if none exist
            $shiftDates = [
                now()->subDays(7),
                now()->subDays(6),
                now()->subDays(5),
                now()->subDays(4),
                now()->subDays(3),
                now()->subDays(2),
                now()->subDays(1),
                now(),
                now()->addDays(1),
                now()->addDays(2)
            ];

            $roles = ['Registered Nurse', 'Care Assistant', 'Senior Care Worker', 'Night Shift Nurse'];
            
            foreach ($shiftDates as $index => $date) {
                Shift::create([
                    'id' => \Str::uuid(),
                    'title' => 'Sample Shift ' . ($index + 1),
                    'description' => 'Sample shift for timesheet testing',
                    'role' => $roles[array_rand($roles)],
                    'shift_date' => $date->format('Y-m-d'),
                    'start_time' => '08:00',
                    'end_time' => '16:00',
                    'hourly_rate' => rand(1200, 1800) / 100, // £12.00 - £18.00
                    'care_home_id' => $careHome->id,
                    'status' => 'published',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $shifts = Shift::where('care_home_id', $careHome->id)->limit(10)->get();
        }

        $statuses = ['draft', 'submitted', 'approved', 'queried', 'rejected'];
        $statusWeights = [
            'draft' => 10,
            'submitted' => 40,
            'approved' => 30,
            'queried' => 15,
            'rejected' => 5
        ];

        // Create timesheets
        foreach ($shifts as $shift) {
            foreach ($workers->take(rand(1, 3)) as $worker) {
                // Skip if worker already has timesheet for this shift
                $existingTimesheet = Timesheet::where('shift_id', $shift->id)
                    ->where('worker_id', $worker->id)
                    ->first();

                if ($existingTimesheet) {
                    continue;
                }

                // Generate random status based on weights
                $randomStatus = $this->getWeightedRandomStatus($statusWeights);
                
                $shiftDate = Carbon::parse($shift->shift_date);
                $startTime = $shiftDate->copy()->setTimeFromTimeString($shift->start_time);
                $endTime = $shiftDate->copy()->setTimeFromTimeString($shift->end_time);
                
                // Add some variation to actual clock in/out times
                $actualClockIn = $startTime->copy()->addMinutes(rand(-10, 15));
                $actualClockOut = $endTime->copy()->addMinutes(rand(-15, 20));
                
                // Ensure clock out is after clock in
                if ($actualClockOut->lte($actualClockIn)) {
                    $actualClockOut = $actualClockIn->copy()->addHours(8);
                }
                
                // Calculate hours
                $totalMinutes = $actualClockOut->diffInMinutes($actualClockIn);
                $breakMinutes = rand(0, 60); // 0-60 minute break
                $workingMinutes = max(0, $totalMinutes - $breakMinutes); // Ensure positive
                $totalHours = round($workingMinutes / 60, 2);
                
                // Calculate overtime (anything over 8 hours)
                $regularHours = min($totalHours, 8);
                $overtimeHours = max(0, $totalHours - 8);
                
                $hourlyRate = $shift->hourly_rate;
                $overtimeRate = $hourlyRate * 1.5; // Time and a half
                
                $regularPay = $regularHours * $hourlyRate;
                $overtimePay = $overtimeHours * $overtimeRate;
                $totalPay = $regularPay + $overtimePay;

                $timesheetData = [
                    'id' => \Str::uuid(),
                    'worker_id' => $worker->id,
                    'shift_id' => $shift->id,
                    'care_home_id' => $careHome->id,
                    'status' => $randomStatus,
                    'clock_in_time' => $actualClockIn,
                    'clock_out_time' => $actualClockOut,
                    'break_duration_minutes' => $breakMinutes,
                    'total_hours' => $totalHours,
                    'hourly_rate' => $hourlyRate,
                    'overtime_hours' => $overtimeHours,
                    'overtime_rate' => $overtimeHours > 0 ? $overtimeRate : null,
                    'total_pay' => $totalPay,
                ];

                // Add notes based on status
                if ($randomStatus === 'queried') {
                    $timesheetData['manager_notes'] = 'Please clarify the extended break time on this shift.';
                } elseif ($randomStatus === 'rejected') {
                    $timesheetData['manager_notes'] = 'Clock out time appears incorrect. Please resubmit with correct timing.';
                } elseif ($randomStatus === 'approved') {
                    $timesheetData['approved_at'] = now()->subHours(rand(1, 48));
                    // Randomly assign approver from care home admins
                    $approver = User::where('role', 'care_home_admin')->inRandomOrder()->first();
                    if ($approver) {
                        $timesheetData['approved_by'] = $approver->id;
                    }
                }

                // Add worker notes for some timesheets
                if (rand(1, 100) <= 30) { // 30% chance of worker notes
                    $workerNotes = [
                        'Had to stay late due to emergency situation with resident.',
                        'Covered additional duties as colleague called in sick.',
                        'Completed medication round and assisted with meal service.',
                        'Attended to resident fall incident and completed paperwork.',
                        'Provided extra support during shift handover.',
                    ];
                    $timesheetData['worker_notes'] = $workerNotes[array_rand($workerNotes)];
                }

                if ($randomStatus === 'submitted') {
                    $timesheetData['submitted_at'] = now()->subHours(rand(1, 72));
                }

                Timesheet::create($timesheetData);
            }
        }

        $this->command->info('Sample timesheets created successfully!');
        
        // Show summary
        $counts = [];
        foreach ($statuses as $status) {
            $counts[$status] = Timesheet::where('status', $status)->count();
        }
        
        $this->command->table(
            ['Status', 'Count'],
            collect($counts)->map(fn($count, $status) => [ucfirst($status), $count])->toArray()
        );
    }

    /**
     * Get a weighted random status
     */
    private function getWeightedRandomStatus(array $weights): string
    {
        $totalWeight = array_sum($weights);
        $random = rand(1, $totalWeight);
        
        foreach ($weights as $status => $weight) {
            if ($random <= $weight) {
                return $status;
            }
            $random -= $weight;
        }
        
        return 'submitted'; // fallback
    }
}
