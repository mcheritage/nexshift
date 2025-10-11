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
        // Create a sample care home
        $careHome = CareHome::create([
            'name' => 'Sunshine Care Home',
        ]);

        $this->command->info('Care Home created: ' . $careHome->name . ' (ID: ' . $careHome->id . ')');

        // Create a care home admin user
        $admin = User::create([
            'first_name' => 'Care Home',
            'last_name' => 'Admin',
            'email' => 'admin@sunshinecare.com',
            'password' => Hash::make('password'),
            'role' => 'care_home_admin',
            'care_home_id' => $careHome->id,
            'gender' => 'other',
            'email_verified_at' => now(),
        ]);

        $this->command->info('Care Home Admin created successfully!');
        $this->command->info('Care Home: ' . $careHome->name);
        $this->command->info('Email: ' . $admin->email);
        $this->command->info('Password: password');
        $this->command->info('Role: ' . $admin->role);
    }
}
