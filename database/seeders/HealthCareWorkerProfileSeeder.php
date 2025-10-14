<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HealthCareWorkerProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workers = [
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah.johnson@example.com',
                'phone_number' => '+44 7700 900123',
                'profile_photo' => 'https://images.unsplash.com/photo-1594824804732-ca58f6352de1?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Experienced registered nurse with over 8 years in elderly care. Passionate about providing compassionate, patient-centered care. Specialized in dementia care and medication management.',
                'qualifications' => [
                    'BSc (Hons) Adult Nursing - University of Manchester (2015)',
                    'NMC Registration - Current',
                    'Dementia Care Specialist Certificate',
                    'Safeguarding Adults Level 3'
                ],
                'certifications' => [
                    'Basic Life Support (BLS) - Valid until 2025',
                    'Medication Administration Certificate',
                    'Manual Handling Certificate',
                    'Fire Safety Training'
                ],
                'years_experience' => 8,
                'skills' => [
                    'Dementia Care',
                    'Medication Management', 
                    'Wound Care',
                    'Patient Assessment',
                    'Care Planning',
                    'Team Leadership',
                    'Mental Health Support'
                ],
                'hourly_rate_min' => 18.50,
                'hourly_rate_max' => 22.00,
                'available_weekends' => true,
                'available_nights' => true,
                'additional_notes' => 'Available for last-minute shifts. Own transport. Excellent references from previous care homes.',
                'role' => 'health_care_worker'
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Chen',
                'email' => 'michael.chen@example.com',
                'phone_number' => '+44 7700 900124',
                'profile_photo' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Dedicated healthcare assistant with 5 years of experience in residential care. Strong background in personal care, mobility assistance, and creating engaging activities for residents.',
                'qualifications' => [
                    'NVQ Level 3 Health and Social Care',
                    'Care Certificate - Complete',
                    'Food Hygiene Level 2',
                    'First Aid at Work Certificate'
                ],
                'certifications' => [
                    'Moving and Handling Certificate - Current',
                    'Infection Control Certificate',
                    'Safeguarding Vulnerable Adults',
                    'Mental Capacity Act Training'
                ],
                'years_experience' => 5,
                'skills' => [
                    'Personal Care',
                    'Mobility Assistance',
                    'Activity Planning',
                    'Meal Preparation',
                    'Companionship',
                    'Record Keeping',
                    'Emergency Response'
                ],
                'hourly_rate_min' => 12.50,
                'hourly_rate_max' => 15.50,
                'available_weekends' => true,
                'available_nights' => false,
                'additional_notes' => 'Fluent in Mandarin and Cantonese. Experience with residents with varying levels of cognitive impairment.',
                'role' => 'health_care_worker'
            ],
            [
                'first_name' => 'Emma',
                'last_name' => 'Williams',
                'email' => 'emma.williams@example.com',
                'phone_number' => '+44 7700 900125',
                'profile_photo' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Senior healthcare worker with extensive experience in end-of-life care and family support. Known for compassionate approach and excellent communication skills.',
                'qualifications' => [
                    'NVQ Level 4 Health and Social Care Leadership',
                    'Palliative Care Certificate',
                    'Mentoring and Assessment Award',
                    'Health and Safety at Work Qualification'
                ],
                'certifications' => [
                    'End of Life Care Certificate',
                    'Grief Counselling Basic Training',
                    'Advanced Communication Skills',
                    'Dignity in Care Training'
                ],
                'years_experience' => 12,
                'skills' => [
                    'End-of-Life Care',
                    'Family Support',
                    'Pain Management',
                    'Emotional Support',
                    'Staff Mentoring',
                    'Quality Assurance',
                    'Care Coordination'
                ],
                'hourly_rate_min' => 16.00,
                'hourly_rate_max' => 20.50,
                'available_weekends' => false,
                'available_nights' => true,
                'additional_notes' => 'Specialist in palliative care. Available for complex cases requiring experienced staff.',
                'role' => 'health_care_worker'
            ],
            [
                'first_name' => 'James',
                'last_name' => 'Thompson',
                'email' => 'james.thompson@example.com',
                'phone_number' => '+44 7700 900126',
                'profile_photo' => 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Enthusiastic new graduate with fresh training and modern approaches to elderly care. Eager to learn and contribute to a caring environment.',
                'qualifications' => [
                    'Level 2 Diploma in Care (2024)',
                    'Care Certificate - Newly Completed',
                    'GCSE Mathematics and English - Grade B',
                    'Customer Service Level 2'
                ],
                'certifications' => [
                    'Basic First Aid Certificate',
                    'Food Safety and Hygiene Level 2',
                    'Manual Handling Training',
                    'Safeguarding Awareness'
                ],
                'years_experience' => 0,
                'skills' => [
                    'Basic Personal Care',
                    'Companionship',
                    'Technology Assistance',
                    'Activity Support',
                    'Meal Service',
                    'Cleaning and Maintenance',
                    'Digital Documentation'
                ],
                'hourly_rate_min' => 10.50,
                'hourly_rate_max' => 13.00,
                'available_weekends' => true,
                'available_nights' => true,
                'additional_notes' => 'New to the field but very motivated. Completed work experience at three different care facilities. Tech-savvy and comfortable with digital systems.',
                'role' => 'health_care_worker'
            ],
            [
                'first_name' => 'Priya',
                'last_name' => 'Patel',
                'email' => 'priya.patel@example.com',
                'phone_number' => '+44 7700 900127',
                'profile_photo' => 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Registered mental health nurse specializing in elderly mental health conditions. Experienced in managing challenging behaviors and providing therapeutic interventions.',
                'qualifications' => [
                    'BSc Mental Health Nursing - Birmingham University (2018)',
                    'NMC Registration - Mental Health Nurse',
                    'Postgraduate Certificate in Dementia Care',
                    'CBT Foundation Course'
                ],
                'certifications' => [
                    'Mental Health First Aid Instructor',
                    'De-escalation Techniques Certificate',
                    'Therapeutic Communication Training',
                    'Autism Awareness Training'
                ],
                'years_experience' => 6,
                'skills' => [
                    'Mental Health Assessment',
                    'Behavioral Management',
                    'Therapeutic Communication',
                    'Medication Administration',
                    'Crisis Intervention',
                    'Family Counseling',
                    'Care Planning'
                ],
                'hourly_rate_min' => 19.00,
                'hourly_rate_max' => 24.00,
                'available_weekends' => true,
                'available_nights' => false,
                'additional_notes' => 'Specialist in mental health aspects of elderly care. Fluent in Hindi and Gujarati. Experience with residents with complex needs.',
                'role' => 'health_care_worker'
            ]
        ];

        foreach ($workers as $workerData) {
            User::create([
                'first_name' => $workerData['first_name'],
                'last_name' => $workerData['last_name'],
                'email' => $workerData['email'],
                'password' => Hash::make('password123'),
                'phone_number' => $workerData['phone_number'],
                'bio' => $workerData['bio'],
                'profile_photo' => $workerData['profile_photo'],
                'qualifications' => $workerData['qualifications'],
                'certifications' => $workerData['certifications'],
                'years_experience' => $workerData['years_experience'],
                'skills' => $workerData['skills'],
                'hourly_rate_min' => $workerData['hourly_rate_min'],
                'hourly_rate_max' => $workerData['hourly_rate_max'],
                'available_weekends' => $workerData['available_weekends'],
                'available_nights' => $workerData['available_nights'],
                'additional_notes' => $workerData['additional_notes'],
                'role' => $workerData['role'],
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Created 5 healthcare workers with complete profiles:');
        $this->command->info('1. Sarah Johnson (Senior RN, 8 years exp) - sarah.johnson@example.com');
        $this->command->info('2. Michael Chen (Healthcare Assistant, 5 years exp) - michael.chen@example.com');
        $this->command->info('3. Emma Williams (Senior Worker, 12 years exp) - emma.williams@example.com');
        $this->command->info('4. James Thompson (New Graduate, 0 years exp) - james.thompson@example.com');
        $this->command->info('5. Priya Patel (Mental Health RN, 6 years exp) - priya.patel@example.com');
        $this->command->info('All passwords: password123');
    }
}
