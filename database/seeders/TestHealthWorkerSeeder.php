<?php

namespace Database\Seeders;

use App\Models\BankDetails;
use App\Models\HealthcareProfile;
use App\Models\Skill;
use App\Models\User;
use App\Models\WorkExperience;
use App\UserRoles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Test Health Worker Seeder
 * 
 * This seeder creates a test health_worker account specifically for use during
 * mobile app deployment and review processes by Google Play and Apple App Store.
 * 
 * Usage:
 * php artisan db:seed --class=TestHealthWorkerSeeder
 * 
 * Test Account Credentials:
 * Email: test.healthworker@nexshift.com
 * Password: TestHealthWorker2025!
 * Role: health_worker
 * Status: approved
 */
class TestHealthWorkerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating test health worker account for mobile app deployment...');

        // Create test health worker user
        $user = User::updateOrCreate(
            ['email' => 'test.healthworker@nexshift.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Health Worker',
                'gender' => 'other',
                'email' => 'test.healthworker@nexshift.com',
                'password' => Hash::make('TestHealthWorker2025!'),
                'email_verified_at' => now(),
                'phone_number' => '+44 7700 900999',
                'profile_photo' => null,
                'bio' => 'Test account for mobile app deployment and review processes. This account is used by Google Play and Apple App Store reviewers to test the NexShift mobile application.',
                'qualifications' => [
                    'NVQ Level 3 Health and Social Care',
                    'Care Certificate - Complete',
                    'First Aid at Work Certificate',
                ],
                'certifications' => [
                    'Basic Life Support (BLS) - Valid until 2026',
                    'Manual Handling Certificate',
                    'Safeguarding Vulnerable Adults Level 2',
                ],
                'years_experience' => 3,
                'skills' => [
                    'Personal Care',
                    'Mobility Assistance',
                    'Medication Support',
                    'Companionship',
                    'Record Keeping',
                ],
                'hourly_rate_min' => 12.00,
                'hourly_rate_max' => 16.00,
                'available_weekends' => true,
                'available_nights' => true,
                'additional_notes' => 'This is a test account created for mobile app deployment. Account is fully approved and ready for testing.',
                'role' => UserRoles::HEALTH_WORKER->value,
                'status' => 'approved',
                'approved_at' => now(),
            ]
        );

        // Create healthcare profile
        HealthcareProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'is_profile_complete' => true,
            ]
        );

        // Add work experience
        WorkExperience::updateOrCreate(
            [
                'user_id' => $user->id,
                'company_name' => 'Test Care Facility',
                'position' => 'Healthcare Assistant',
                'start_date' => '2022-01-01',
            ],
            [
                'end_date' => null,
                'is_current' => true,
                'description' => 'Test work experience entry for mobile app deployment testing.',
            ]
        );

        // Add skills
        $skills = [
            [
                'name' => 'Personal Care',
                'category' => 'Support',
                'proficiency_level' => 'Advanced',
                'years_experience' => 3,
            ],
            [
                'name' => 'Mobility Assistance',
                'category' => 'Support',
                'proficiency_level' => 'Advanced',
                'years_experience' => 3,
            ],
            [
                'name' => 'Medication Support',
                'category' => 'Clinical',
                'proficiency_level' => 'Intermediate',
                'years_experience' => 2,
            ],
        ];

        foreach ($skills as $skillData) {
            Skill::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $skillData['name'],
                ],
                [
                    'category' => $skillData['category'],
                    'proficiency_level' => $skillData['proficiency_level'],
                    'years_experience' => $skillData['years_experience'],
                ]
            );
        }

        // Add bank details (test data)
        BankDetails::updateOrCreate(
            ['user_id' => $user->id],
            [
                'account_holder_name' => 'Test Health Worker',
                'sort_code' => '999999',
                'account_number' => '99999999',
                'bank_name' => 'Test Bank',
                'is_verified' => false,
            ]
        );

        $this->command->info('✓ Test health worker account created successfully!');
        $this->command->info('');
        $this->command->info('Test Account Details:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('Email:    test.healthworker@nexshift.com');
        $this->command->info('Password: TestHealthWorker2025!');
        $this->command->info('Role:     health_worker');
        $this->command->info('Status:   approved');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('');
        $this->command->info('This account is ready for use by Google Play and Apple App Store reviewers.');
    }
}

