<?php

namespace Database\Seeders;

use App\Models\CareHome;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating shift data...');

        // Get care homes and admin users
        $careHomes = CareHome::with('admin_user')->get();
        
        if ($careHomes->isEmpty()) {
            $this->command->error('No care homes found. Run CareHomeSeeder first.');
            return;
        }

        $shifts = [];
        $roles = [
            'registered_nurse',
            'healthcare_assistant', 
            'support_worker',
            'senior_care_worker',
            'night_shift_worker',
            'bank_staff'
        ];

        $requiredSkills = [
            'registered_nurse' => ['Medication Administration', 'Patient Assessment', 'Wound Care', 'Care Planning'],
            'healthcare_assistant' => ['Personal Care', 'Mobility Support', 'Meal Assistance', 'Companionship'],
            'support_worker' => ['Personal Care', 'Household Tasks', 'Social Support', 'Transportation'],
            'senior_care_worker' => ['Team Leadership', 'Care Planning', 'Medication Support', 'Staff Training'],
            'night_shift_worker' => ['Night Care', 'Safety Monitoring', 'Emergency Response', 'Medication Administration'],
            'bank_staff' => ['Flexible Working', 'Multiple Roles', 'Quick Adaptation', 'Team Support']
        ];

        $requiredQualifications = [
            'registered_nurse' => ['NMC Registration', 'BSc Nursing Degree', 'DBS Check'],
            'healthcare_assistant' => ['Care Certificate', 'DBS Check', 'Manual Handling'],
            'support_worker' => ['DBS Check', 'Care Certificate', 'First Aid'],
            'senior_care_worker' => ['NVQ Level 3', 'DBS Check', 'Leadership Training'],
            'night_shift_worker' => ['DBS Check', 'Night Care Certificate', 'Emergency First Aid'],
            'bank_staff' => ['DBS Check', 'Multiple Certifications', 'Flexible Training']
        ];

        // Generate shifts for the next 30 days
        for ($i = 0; $i < 30; $i++) {
            $shiftDate = Carbon::now()->addDays($i);
            
            // Skip weekends for some shifts (but not all)
            if ($shiftDate->isWeekend() && rand(1, 3) === 1) {
                continue;
            }

            $careHome = $careHomes->random();
            $adminUser = $careHome->user;
            
            if (!$adminUser) {
                continue;
            }

            $role = $roles[array_rand($roles)];
            
            // Generate different shift patterns
            $shiftPatterns = [
                ['start' => '07:00', 'end' => '15:00', 'rate' => 18.50], // Day shift
                ['start' => '15:00', 'end' => '23:00', 'rate' => 19.00], // Evening shift
                ['start' => '23:00', 'end' => '07:00', 'rate' => 22.00], // Night shift
                ['start' => '08:00', 'end' => '16:00', 'rate' => 18.00], // Standard day
                ['start' => '12:00', 'end' => '20:00', 'rate' => 19.50], // Afternoon shift
            ];

            $pattern = $shiftPatterns[array_rand($shiftPatterns)];
            
            // Calculate duration
            $startTime = Carbon::parse($pattern['start']);
            $endTime = Carbon::parse($pattern['end']);
            if ($endTime->lessThan($startTime)) {
                $endTime->addDay();
            }
            $durationHours = $endTime->diffInHours($startTime, true);

            // Build full datetimes for the shift (handle overnight)
            $startDatetime = $shiftDate->copy()->setTimeFromTimeString($pattern['start']);
            $endDatetime = $shiftDate->copy()->setTimeFromTimeString($pattern['end']);
            if ($endDatetime->lte($startDatetime)) {
                $endDatetime->addDay();
            }

            // Generate shift titles
            $titles = [
                'Daily Care Support',
                'Personal Care Assistant',
                'Medication Administration',
                'Companion Care',
                'Mobility Support',
                'Meal Assistance',
                'Night Care Support',
                'Weekend Relief',
                'Emergency Cover',
                'Special Care Needs',
                'Dementia Support',
                'Rehabilitation Support'
            ];

            $title = $titles[array_rand($titles)];
            
            // Generate descriptions
            $descriptions = [
                'Provide compassionate care and support to residents, ensuring their comfort and wellbeing throughout the shift.',
                'Assist residents with daily activities, medication administration, and provide companionship.',
                'Support residents with personal care, mobility assistance, and meal preparation.',
                'Provide specialized care for residents with specific needs, ensuring safety and comfort.',
                'Work as part of a dedicated team to deliver high-quality care and support services.',
                'Offer emotional support and companionship while assisting with daily living activities.',
                'Ensure residents receive proper care, medication, and support throughout the shift.',
                'Provide professional care services with focus on dignity, respect, and individual needs.',
            ];

            $description = $descriptions[array_rand($descriptions)];

            // Special requirements
            $specialRequirements = [
                'Must have experience with dementia care',
                'Experience with mobility equipment preferred',
                'Must be comfortable with personal care tasks',
                'Previous care home experience required',
                'Must be able to work independently',
                'Experience with medication administration',
                'Must have excellent communication skills',
                'Previous night shift experience preferred',
                'Must be physically fit for lifting and moving',
                'Experience with challenging behaviors preferred'
            ];

            $specialReq = rand(1, 3) === 1 ? $specialRequirements[array_rand($specialRequirements)] : null;

            // Determine if shift is urgent (within 48 hours)
            $isUrgent = $shiftDate->diffInHours(Carbon::now()) <= 48;

            // Determine status - most shifts should be published
            $statusOptions = ['published', 'published', 'published', 'draft']; // 75% published
            $status = $statusOptions[array_rand($statusOptions)];

            $shift = [
                'care_home_id' => $careHome->id,
                'title' => $title,
                'description' => $description,
                'role' => $role,
                'start_datetime' => $startDatetime->format('Y-m-d H:i:s'),
                'end_datetime' => $endDatetime->format('Y-m-d H:i:s'),
                'duration_hours' => $durationHours,
                'hourly_rate' => $pattern['rate'],
                'total_pay' => $pattern['rate'] * $durationHours,
                'required_skills' => $requiredSkills[$role],
                'required_qualifications' => $requiredQualifications[$role],
                'special_requirements' => $specialReq,
                'status' => $status,
                'max_applicants' => rand(1, 3),
                'is_urgent' => $isUrgent,
                'is_recurring' => rand(1, 4) === 1, // 25% recurring
                'recurrence_pattern' => rand(1, 4) === 1 ? (rand(1, 2) === 1 ? 'weekly' : 'monthly') : null,
                'application_deadline' => $startDatetime->copy()->subHours(2)->format('Y-m-d H:i:s'),
                'published_at' => $status === 'published' ? Carbon::now()->subDays(rand(0, 7))->format('Y-m-d H:i:s') : null,
                'created_by' => $adminUser->id,
            ];

            $shifts[] = $shift;
        }

        // Create shifts one by one to handle JSON casting properly
        foreach ($shifts as $shiftData) {
            Shift::create($shiftData);
        }

        $this->command->info('Successfully created ' . count($shifts) . ' shifts!');
        $this->command->info('Shifts include:');
        $this->command->info('- Various roles: ' . implode(', ', $roles));
        $this->command->info('- Different shift patterns (day, evening, night)');
        $this->command->info('- Mix of urgent and regular shifts');
        $this->command->info('- Published and draft statuses');
        $this->command->info('- Realistic hourly rates (£18-£22)');
        $this->command->info('- Required skills and qualifications per role');
    }
}
