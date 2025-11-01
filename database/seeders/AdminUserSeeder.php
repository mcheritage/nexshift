<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@nexshift.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'super_admin',
            'is_admin' => 1,
            'gender' => 'other',
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@nexshift.com');
        $this->command->info('Password: password');
    }
}
