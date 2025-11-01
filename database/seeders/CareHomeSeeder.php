<?php

namespace Database\Seeders;

use App\Models\CareHome;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CareHomeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $careHomes = [
            [
                'name' => 'Sunshine Care Home',
                'admin' => [
                    'first_name' => 'Sarah',
                    'last_name' => 'Johnson',
                    'email' => 'admin@sunshinecare.com',
                    'gender' => 'female',
                ]
            ],
            [
                'name' => 'Riverside Manor',
                'admin' => [
                    'first_name' => 'Michael',
                    'last_name' => 'Thompson',
                    'email' => 'admin@riversidemanor.com',
                    'gender' => 'male',
                ]
            ],
            [
                'name' => 'Oakwood Senior Living',
                'admin' => [
                    'first_name' => 'Emma',
                    'last_name' => 'Williams',
                    'email' => 'admin@oakwoodsenior.com',
                    'gender' => 'female',
                ]
            ],
            [
                'name' => 'Maple Grove Care Center',
                'admin' => [
                    'first_name' => 'David',
                    'last_name' => 'Brown',
                    'email' => 'admin@maplegrovecare.com',
                    'gender' => 'male',
                ]
            ],
            [
                'name' => 'Willowbrook Nursing Home',
                'admin' => [
                    'first_name' => 'Lisa',
                    'last_name' => 'Davis',
                    'email' => 'admin@willowbrooknursing.com',
                    'gender' => 'female',
                ]
            ],
            [
                'name' => 'Cedar Heights Care',
                'admin' => [
                    'first_name' => 'Robert',
                    'last_name' => 'Wilson',
                    'email' => 'admin@cedarheightscare.com',
                    'gender' => 'male',
                ]
            ],
            [
                'name' => 'Pine Valley Assisted Living',
                'admin' => [
                    'first_name' => 'Jennifer',
                    'last_name' => 'Miller',
                    'email' => 'admin@pinevalleyassisted.com',
                    'gender' => 'female',
                ]
            ],
            [
                'name' => 'Golden Years Care Home',
                'admin' => [
                    'first_name' => 'Christopher',
                    'last_name' => 'Anderson',
                    'email' => 'admin@goldenyearscare.com',
                    'gender' => 'male',
                ]
            ],
            [
                'name' => 'Rose Garden Senior Care',
                'admin' => [
                    'first_name' => 'Amanda',
                    'last_name' => 'Taylor',
                    'email' => 'admin@rosegardensenior.com',
                    'gender' => 'female',
                ]
            ],
            [
                'name' => 'Harmony House Care',
                'admin' => [
                    'first_name' => 'James',
                    'last_name' => 'Martinez',
                    'email' => 'admin@harmonyhousecare.com',
                    'gender' => 'male',
                ]
            ]
        ];

        foreach ($careHomes as $careHomeData) {
            // Create care home
            $careHome = CareHome::create([
                'name' => $careHomeData['name'],
            ]);

            $this->command->info('Care Home created: ' . $careHome->name . ' (ID: ' . $careHome->id . ')');

            // Create care home admin user
            $admin = User::create([
                'first_name' => $careHomeData['admin']['first_name'],
                'last_name' => $careHomeData['admin']['last_name'],
                'email' => $careHomeData['admin']['email'],
                'password' => Hash::make('password'),
                'role' => 'care_home_admin',
                'care_home_id' => $careHome->id,
                'gender' => $careHomeData['admin']['gender'],
                'email_verified_at' => now(),
            ]);

            $this->command->info('Care Home Admin created: ' . $admin->first_name . ' ' . $admin->last_name);
            $this->command->info('Email: ' . $admin->email);
            $this->command->info('Password: password');
            $this->command->info('Role: ' . $admin->role);
            $this->command->info('---');
        }

        $this->command->info('Successfully created ' . count($careHomes) . ' care homes with admin users!');
    }
}
