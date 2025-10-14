<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating test data for the Enhanced Applicant Review System...');
        
        // Create healthcare workers with complete profiles
        $this->call(HealthCareWorkerProfileSeeder::class);
        
        // Create test applications
        $this->call(TestApplicationSeeder::class);
        
        $this->command->info('');
        $this->command->info('🎉 Test data created successfully!');
        $this->command->info('');
        $this->command->info('You can now:');
        $this->command->info('1. Log in as a care home admin to review applications');
        $this->command->info('2. Visit /applications/shift/{shift-id} to see the enhanced review system');
        $this->command->info('3. Test the search, filtering, and profile viewing features');
        $this->command->info('');
        $this->command->info('Healthcare Workers Created:');
        $this->command->info('- sarah.johnson@example.com (password: password123)');
        $this->command->info('- michael.chen@example.com (password: password123)');
        $this->command->info('- emma.williams@example.com (password: password123)');
        $this->command->info('- james.thompson@example.com (password: password123)');
        $this->command->info('- priya.patel@example.com (password: password123)');
    }
}