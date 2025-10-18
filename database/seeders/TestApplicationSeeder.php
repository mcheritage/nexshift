<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Shift;
use App\Models\Application;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get our test healthcare workers
        $workers = User::where('role', 'health_care_worker')
            ->whereIn('email', [
                'sarah.johnson@example.com',
                'michael.chen@example.com', 
                'emma.williams@example.com',
                'james.thompson@example.com',
                'priya.patel@example.com'
            ])->get();

        // Get available shifts
        $shifts = Shift::where('status', 'published')->take(3)->get();

        if ($workers->isEmpty()) {
            $this->command->error('No healthcare workers found. Run HealthCareWorkerProfileSeeder first.');
            return;
        }

        if ($shifts->isEmpty()) {
            $this->command->error('No published shifts found. Create some shifts first.');
            return;
        }

        $applicationMessages = [
            "I am very interested in this position. I have extensive experience in elderly care and would love to contribute to your team. I'm available for the full shift and can start immediately.",
            "Hello, I would like to apply for this shift. I have relevant qualifications and am passionate about providing quality care. Please consider my application.",
            "I am writing to express my interest in this healthcare position. My background in dementia care makes me well-suited for this role. I'm flexible with timing and committed to excellence.",
            "I would be delighted to work this shift. I have strong communication skills and experience with diverse patient needs. Thank you for considering my application.",
            "This position aligns perfectly with my skills and career goals. I bring a compassionate approach and professional expertise. I look forward to contributing to your care team."
        ];

        $createdApplications = 0;

        foreach ($shifts as $shift) {
            // Apply 3-4 workers to each shift for good variety
            $workersToApply = $workers->random(rand(3, 4));
            
            foreach ($workersToApply as $index => $worker) {
                // Skip if application already exists
                if (Application::where('shift_id', $shift->id)->where('worker_id', $worker->id)->exists()) {
                    continue;
                }

                $application = Application::create([
                    'shift_id' => $shift->id,
                    'worker_id' => $worker->id,
                    'status' => $index == 0 ? 'pending' : (rand(1, 10) > 7 ? 'rejected' : 'pending'), // Most pending, some rejected
                    'message' => $applicationMessages[array_rand($applicationMessages)],
                    'applied_at' => now()->subHours(rand(1, 72)), // Applied 1-72 hours ago
                    'reviewed_at' => $index == 0 ? null : (rand(1, 10) > 5 ? now()->subHours(rand(1, 24)) : null),
                    'review_notes' => ($index != 0 && rand(1, 10) > 7) ? 'Thank you for your application. Unfortunately, we found a candidate with more specific experience for this particular shift.' : null,
                ]);

                $createdApplications++;
            }
        }

        $this->command->info("Created {$createdApplications} test applications");
        $this->command->info("Applications distributed across " . $shifts->count() . " shifts");
        $this->command->info("You can now test the enhanced applicant review system!");
        
        // Show summary
        $this->command->info("\nApplication Summary:");
        foreach ($shifts as $shift) {
            $appCount = Application::where('shift_id', $shift->id)->count();
            $pendingCount = Application::where('shift_id', $shift->id)->where('status', 'pending')->count();
            $this->command->info("- {$shift->title}: {$appCount} applications ({$pendingCount} pending)");
        }
    }
}
