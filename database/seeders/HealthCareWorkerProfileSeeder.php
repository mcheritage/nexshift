<?php

namespace Database\Seeders;

use App\Models\BankDetails;
use App\Models\HealthcareProfile;
use App\Models\Skill;
use App\Models\User;
use App\Models\WorkExperience;
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
                'user' => [
                    'first_name' => 'Sarah',
                    'last_name' => 'Johnson',
                    'gender' => 'female',
                    'email' => 'sarah.johnson@example.com',
                    'password' => 'password123',
                    'phone_number' => '+44 7700 900123',
                    'profile_photo' => 'https://images.unsplash.com/photo-1594824804732-ca58f6352de1?w=150&h=150&fit=crop&crop=face',
                    'bio' => 'Experienced registered nurse with over 8 years in elderly care. Passionate about providing compassionate, patient-centered care. Specialized in dementia care and medication management.',
                    'qualifications' => [
                        'BSc (Hons) Adult Nursing - University of Manchester (2015)',
                        'NMC Registration - Current',
                        'Dementia Care Specialist Certificate',
                        'Safeguarding Adults Level 3',
                    ],
                    'certifications' => [
                        'Basic Life Support (BLS) - Valid until 2025',
                        'Medication Administration Certificate',
                        'Manual Handling Certificate',
                        'Fire Safety Training',
                    ],
                    'years_experience' => 8,
                    'skills' => [
                        'Dementia Care',
                        'Medication Management',
                        'Wound Care',
                        'Patient Assessment',
                        'Care Planning',
                        'Team Leadership',
                        'Mental Health Support',
                    ],
                    'hourly_rate_min' => 18.50,
                    'hourly_rate_max' => 22.00,
                    'available_weekends' => true,
                    'available_nights' => true,
                    'additional_notes' => 'Available for last-minute shifts. Own transport. Excellent references from previous care homes.',
                    'role' => 'health_care_worker',
                ],
                'profile' => [
                    'is_profile_complete' => true,
                ],
                'work_experiences' => [
                    [
                        'company_name' => 'Sunrise Elderly Care',
                        'position' => 'Senior Registered Nurse',
                        'start_date' => '2019-04-01',
                        'end_date' => null,
                        'is_current' => true,
                        'description' => 'Lead nurse for dementia care wing, supervising six nurses and coordinating individualized care plans.',
                    ],
                    [
                        'company_name' => 'Harborview Care Center',
                        'position' => 'Registered Nurse',
                        'start_date' => '2015-08-01',
                        'end_date' => '2019-03-01',
                        'is_current' => false,
                        'description' => 'Provided direct patient care, wound management, and medication administration for long-term residents.',
                    ],
                ],
                'skill_records' => [
                    [
                        'name' => 'Medication Administration',
                        'category' => 'Clinical',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 8,
                    ],
                    [
                        'name' => 'Care Planning',
                        'category' => 'Clinical',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 7,
                    ],
                    [
                        'name' => 'Dementia Care',
                        'category' => 'Specialty',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 6,
                    ],
                ],
                'bank_details' => [
                    'account_holder_name' => 'Sarah Johnson',
                    'sort_code' => '202020',
                    'account_number' => '12345678',
                    'bank_name' => 'Barclays Bank',
                    'is_verified' => true,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Michael',
                    'last_name' => 'Chen',
                    'gender' => 'male',
                    'email' => 'michael.chen@example.com',
                    'password' => 'password123',
                    'phone_number' => '+44 7700 900124',
                    'profile_photo' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
                    'bio' => 'Dedicated healthcare assistant with 5 years of experience in residential care. Strong background in personal care, mobility assistance, and creating engaging activities for residents.',
                    'qualifications' => [
                        'NVQ Level 3 Health and Social Care',
                        'Care Certificate - Complete',
                        'Food Hygiene Level 2',
                        'First Aid at Work Certificate',
                    ],
                    'certifications' => [
                        'Moving and Handling Certificate - Current',
                        'Infection Control Certificate',
                        'Safeguarding Vulnerable Adults',
                        'Mental Capacity Act Training',
                    ],
                    'years_experience' => 5,
                    'skills' => [
                        'Personal Care',
                        'Mobility Assistance',
                        'Activity Planning',
                        'Meal Preparation',
                        'Companionship',
                        'Record Keeping',
                        'Emergency Response',
                    ],
                    'hourly_rate_min' => 12.50,
                    'hourly_rate_max' => 15.50,
                    'available_weekends' => true,
                    'available_nights' => false,
                    'additional_notes' => 'Fluent in Mandarin and Cantonese. Experience with residents with varying levels of cognitive impairment.',
                    'role' => 'health_care_worker',
                ],
                'profile' => [
                    'is_profile_complete' => true,
                ],
                'work_experiences' => [
                    [
                        'company_name' => 'Willowbrook Assisted Living',
                        'position' => 'Healthcare Assistant',
                        'start_date' => '2021-02-01',
                        'end_date' => null,
                        'is_current' => true,
                        'description' => 'Supports residents with daily living activities and monitors vital signs for nursing staff.',
                    ],
                    [
                        'company_name' => 'Harmony Senior Care',
                        'position' => 'Care Assistant',
                        'start_date' => '2018-01-01',
                        'end_date' => '2021-01-01',
                        'is_current' => false,
                        'description' => 'Coordinated group activities and mobility assistance for residents with physical limitations.',
                    ],
                ],
                'skill_records' => [
                    [
                        'name' => 'Mobility Assistance',
                        'category' => 'Support',
                        'proficiency_level' => 'Advanced',
                        'years_experience' => 5,
                    ],
                    [
                        'name' => 'Companionship',
                        'category' => 'Soft Skills',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 5,
                    ],
                    [
                        'name' => 'Infection Control',
                        'category' => 'Clinical',
                        'proficiency_level' => 'Advanced',
                        'years_experience' => 4,
                    ],
                ],
                'bank_details' => [
                    'account_holder_name' => 'Michael Chen',
                    'sort_code' => '404040',
                    'account_number' => '87654321',
                    'bank_name' => 'HSBC UK',
                    'is_verified' => true,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Emma',
                    'last_name' => 'Williams',
                    'gender' => 'female',
                    'email' => 'emma.williams@example.com',
                    'password' => 'password123',
                    'phone_number' => '+44 7700 900125',
                    'profile_photo' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
                    'bio' => 'Senior healthcare worker with extensive experience in end-of-life care and family support. Known for compassionate approach and excellent communication skills.',
                    'qualifications' => [
                        'NVQ Level 4 Health and Social Care Leadership',
                        'Palliative Care Certificate',
                        'Mentoring and Assessment Award',
                        'Health and Safety at Work Qualification',
                    ],
                    'certifications' => [
                        'End of Life Care Certificate',
                        'Grief Counselling Basic Training',
                        'Advanced Communication Skills',
                        'Dignity in Care Training',
                    ],
                    'years_experience' => 12,
                    'skills' => [
                        'End-of-Life Care',
                        'Family Support',
                        'Pain Management',
                        'Emotional Support',
                        'Staff Mentoring',
                        'Quality Assurance',
                        'Care Coordination',
                    ],
                    'hourly_rate_min' => 16.00,
                    'hourly_rate_max' => 20.50,
                    'available_weekends' => false,
                    'available_nights' => true,
                    'additional_notes' => 'Specialist in palliative care. Available for complex cases requiring experienced staff.',
                    'role' => 'health_care_worker',
                ],
                'profile' => [
                    'is_profile_complete' => true,
                ],
                'work_experiences' => [
                    [
                        'company_name' => 'St. Anne Hospice',
                        'position' => 'Senior Healthcare Worker',
                        'start_date' => '2016-06-01',
                        'end_date' => null,
                        'is_current' => true,
                        'description' => 'Oversees palliative care plans and provides mentorship to junior staff.',
                    ],
                    [
                        'company_name' => 'CarePlus Support Services',
                        'position' => 'Healthcare Worker',
                        'start_date' => '2012-03-01',
                        'end_date' => '2016-05-01',
                        'is_current' => false,
                        'description' => 'Delivered compassionate end-of-life care and coordinated multidisciplinary teams.',
                    ],
                ],
                'skill_records' => [
                    [
                        'name' => 'Palliative Care',
                        'category' => 'Specialty',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 10,
                    ],
                    [
                        'name' => 'Family Liaison',
                        'category' => 'Soft Skills',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 9,
                    ],
                    [
                        'name' => 'Staff Mentorship',
                        'category' => 'Leadership',
                        'proficiency_level' => 'Advanced',
                        'years_experience' => 6,
                    ],
                ],
                'bank_details' => [
                    'account_holder_name' => 'Emma Williams',
                    'sort_code' => '505050',
                    'account_number' => '24681357',
                    'bank_name' => 'Lloyds Bank',
                    'is_verified' => true,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'James',
                    'last_name' => 'Thompson',
                    'gender' => 'male',
                    'email' => 'james.thompson@example.com',
                    'password' => 'password123',
                    'phone_number' => '+44 7700 900126',
                    'profile_photo' => 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face',
                    'bio' => 'Enthusiastic new graduate with fresh training and modern approaches to elderly care. Eager to learn and contribute to a caring environment.',
                    'qualifications' => [
                        'Level 2 Diploma in Care (2024)',
                        'Care Certificate - Newly Completed',
                        'GCSE Mathematics and English - Grade B',
                        'Customer Service Level 2',
                    ],
                    'certifications' => [
                        'Basic First Aid Certificate',
                        'Food Safety and Hygiene Level 2',
                        'Manual Handling Training',
                        'Safeguarding Awareness',
                    ],
                    'years_experience' => 0,
                    'skills' => [
                        'Basic Personal Care',
                        'Companionship',
                        'Technology Assistance',
                        'Activity Support',
                        'Meal Service',
                        'Cleaning and Maintenance',
                        'Digital Documentation',
                    ],
                    'hourly_rate_min' => 10.50,
                    'hourly_rate_max' => 13.00,
                    'available_weekends' => true,
                    'available_nights' => true,
                    'additional_notes' => 'New to the field but very motivated. Completed work experience at three different care facilities. Tech-savvy and comfortable with digital systems.',
                    'role' => 'health_care_worker',
                ],
                'profile' => [
                    'is_profile_complete' => true,
                ],
                'work_experiences' => [
                    [
                        'company_name' => 'Bright Futures Care',
                        'position' => 'Healthcare Assistant Intern',
                        'start_date' => '2024-02-01',
                        'end_date' => '2024-08-01',
                        'is_current' => false,
                        'description' => 'Completed rotations across dementia care, mobility support, and nutrition assistance teams.',
                    ],
                ],
                'skill_records' => [
                    [
                        'name' => 'Digital Documentation',
                        'category' => 'Administrative',
                        'proficiency_level' => 'Advanced',
                        'years_experience' => 1,
                    ],
                    [
                        'name' => 'Personal Care',
                        'category' => 'Support',
                        'proficiency_level' => 'Intermediate',
                        'years_experience' => 1,
                    ],
                    [
                        'name' => 'Activity Support',
                        'category' => 'Support',
                        'proficiency_level' => 'Intermediate',
                        'years_experience' => 1,
                    ],
                ],
                'bank_details' => [
                    'account_holder_name' => 'James Thompson',
                    'sort_code' => '303030',
                    'account_number' => '13572468',
                    'bank_name' => 'Nationwide Building Society',
                    'is_verified' => false,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Priya',
                    'last_name' => 'Patel',
                    'gender' => 'female',
                    'email' => 'priya.patel@example.com',
                    'password' => 'password123',
                    'phone_number' => '+44 7700 900127',
                    'profile_photo' => 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
                    'bio' => 'Registered mental health nurse specializing in elderly mental health conditions. Experienced in managing challenging behaviors and providing therapeutic interventions.',
                    'qualifications' => [
                        'BSc Mental Health Nursing - Birmingham University (2018)',
                        'NMC Registration - Mental Health Nurse',
                        'Postgraduate Certificate in Dementia Care',
                        'CBT Foundation Course',
                    ],
                    'certifications' => [
                        'Mental Health First Aid Instructor',
                        'De-escalation Techniques Certificate',
                        'Therapeutic Communication Training',
                        'Autism Awareness Training',
                    ],
                    'years_experience' => 6,
                    'skills' => [
                        'Mental Health Assessment',
                        'Behavioral Management',
                        'Therapeutic Communication',
                        'Medication Administration',
                        'Crisis Intervention',
                        'Family Counseling',
                        'Care Planning',
                    ],
                    'hourly_rate_min' => 19.00,
                    'hourly_rate_max' => 24.00,
                    'available_weekends' => true,
                    'available_nights' => false,
                    'additional_notes' => 'Specialist in mental health aspects of elderly care. Fluent in Hindi and Gujarati. Experience with residents with complex needs.',
                    'role' => 'health_care_worker',
                ],
                'profile' => [
                    'is_profile_complete' => true,
                ],
                'work_experiences' => [
                    [
                        'company_name' => 'Mindful Care Clinic',
                        'position' => 'Mental Health Nurse',
                        'start_date' => '2020-05-01',
                        'end_date' => null,
                        'is_current' => true,
                        'description' => 'Provides mental health assessments and therapeutic interventions for elderly patients.',
                    ],
                    [
                        'company_name' => 'Silver Oak Nursing',
                        'position' => 'Registered Nurse',
                        'start_date' => '2018-07-01',
                        'end_date' => '2020-04-01',
                        'is_current' => false,
                        'description' => 'Led behavioural support programs for residents with complex needs and chronic conditions.',
                    ],
                ],
                'skill_records' => [
                    [
                        'name' => 'Crisis Intervention',
                        'category' => 'Specialty',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 5,
                    ],
                    [
                        'name' => 'Therapeutic Communication',
                        'category' => 'Soft Skills',
                        'proficiency_level' => 'Expert',
                        'years_experience' => 6,
                    ],
                    [
                        'name' => 'Behavioral Management',
                        'category' => 'Specialty',
                        'proficiency_level' => 'Advanced',
                        'years_experience' => 6,
                    ],
                ],
                'bank_details' => [
                    'account_holder_name' => 'Priya Patel',
                    'sort_code' => '101010',
                    'account_number' => '19283746',
                    'bank_name' => 'Santander UK',
                    'is_verified' => true,
                ],
            ],
        ];

        foreach ($workers as $worker) {
            $userData = $worker['user'];
            $email = $userData['email'];
            $password = $userData['password'] ?? 'password123';
            $emailVerifiedAt = $userData['email_verified_at'] ?? now();

            unset($userData['password'], $userData['email_verified_at']);

            $user = User::updateOrCreate(
                ['email' => $email],
                array_merge($userData, [
                    'password' => Hash::make($password),
                    'email_verified_at' => $emailVerifiedAt,
                ])
            );

            HealthcareProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'is_profile_complete' => $worker['profile']['is_profile_complete'] ?? false,
                ]
            );

            foreach ($worker['work_experiences'] as $experience) {
                WorkExperience::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'company_name' => $experience['company_name'],
                        'position' => $experience['position'],
                        'start_date' => $experience['start_date'],
                    ],
                    [
                        'end_date' => $experience['end_date'] ?? null,
                        'is_current' => $experience['is_current'] ?? false,
                        'description' => $experience['description'] ?? null,
                    ]
                );
            }

            foreach ($worker['skill_records'] as $skill) {
                Skill::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'name' => $skill['name'],
                    ],
                    [
                        'category' => $skill['category'],
                        'proficiency_level' => $skill['proficiency_level'],
                        'years_experience' => $skill['years_experience'],
                    ]
                );
            }

            if (!empty($worker['bank_details'])) {
                BankDetails::updateOrCreate(
                    ['user_id' => $user->id],
                    $worker['bank_details']
                );
            }

            $this->command->info("Seeded healthcare worker: {$user->first_name} {$user->last_name} ({$user->email})");
        }

        $this->command->info('All healthcare workers seeded successfully. Default password: password123');
    }
}
