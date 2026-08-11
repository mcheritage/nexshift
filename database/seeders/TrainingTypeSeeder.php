<?php

namespace Database\Seeders;

use App\Models\TrainingType;
use Illuminate\Database\Seeder;

class TrainingTypeSeeder extends Seeder
{
    public function run(): void
    {
        $trainings = [
            // Annual mandatory (CQC core requirements for care settings)
            [
                'name'            => 'Fire Safety',
                'description'     => 'Fire prevention, evacuation procedures, and use of fire-fighting equipment.',
                'validity_months' => 12,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Manual Handling',
                'description'     => 'Safe moving and handling of people and objects to prevent musculoskeletal injury.',
                'validity_months' => 12,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Infection Prevention & Control',
                'description'     => 'Hand hygiene, PPE use, standard precautions, and outbreak management.',
                'validity_months' => 12,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Basic Life Support',
                'description'     => 'CPR, AED use, and emergency first aid response.',
                'validity_months' => 12,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Health & Safety',
                'description'     => 'Workplace safety responsibilities, risk assessment, and incident reporting.',
                'validity_months' => 12,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Food Hygiene & Safety',
                'description'     => 'Safe food handling, storage, and preparation in a care environment.',
                'validity_months' => 12,
                'is_mandatory'    => true,
            ],

            // Biennial mandatory
            [
                'name'            => 'Safeguarding Adults',
                'description'     => 'Recognising and responding to abuse, neglect, and harm. MCA and DOLS awareness.',
                'validity_months' => 24,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Safeguarding Children',
                'description'     => 'Child protection awareness for settings where under-18s may be encountered.',
                'validity_months' => 24,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Equality, Diversity & Inclusion',
                'description'     => 'Promoting equality, avoiding discrimination, and supporting a diverse workforce.',
                'validity_months' => 24,
                'is_mandatory'    => true,
            ],
            [
                'name'            => 'Mental Capacity Act & Deprivation of Liberty Safeguards',
                'description'     => 'Understanding capacity assessments, best interest decisions, and DoLS authorisations.',
                'validity_months' => 24,
                'is_mandatory'    => true,
            ],

            // Optional / role-specific
            [
                'name'            => 'Medication Administration',
                'description'     => 'Safe administration of medication, recording, and error reporting.',
                'validity_months' => 12,
                'is_mandatory'    => false,
            ],
            [
                'name'            => 'Dementia Awareness',
                'description'     => 'Understanding dementia, person-centred care, and communication techniques.',
                'validity_months' => 24,
                'is_mandatory'    => false,
            ],
            [
                'name'            => 'Mental Health Awareness',
                'description'     => 'Supporting service users with mental health conditions.',
                'validity_months' => 24,
                'is_mandatory'    => false,
            ],
            [
                'name'            => 'Conflict Resolution',
                'description'     => 'De-escalation techniques and managing challenging behaviour.',
                'validity_months' => 24,
                'is_mandatory'    => false,
            ],
        ];

        foreach ($trainings as $training) {
            TrainingType::firstOrCreate(
                ['name' => $training['name']],
                array_merge($training, ['is_active' => true])
            );
        }

        $this->command->info('Seeded ' . count($trainings) . ' training types.');
    }
}
