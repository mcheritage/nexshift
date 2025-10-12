<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-user-roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix user roles for existing accounts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing user roles...');
        
        // Update users without roles to health_care_worker (assuming they are workers)
        $usersWithoutRole = \App\Models\User::whereNull('role')
            ->orWhere('role', '')
            ->whereNull('care_home_id')
            ->get();
            
        foreach ($usersWithoutRole as $user) {
            $user->update(['role' => 'health_care_worker']);
            $this->info("Updated user {$user->email} to health_care_worker");
        }
        
        // Update users with care_home_id to care_home_admin
        $careHomeUsers = \App\Models\User::whereNotNull('care_home_id')
            ->where(function($query) {
                $query->whereNull('role')
                    ->orWhere('role', '')
                    ->orWhere('role', '!=', 'care_home_admin');
            })
            ->get();
            
        foreach ($careHomeUsers as $user) {
            $user->update(['role' => 'care_home_admin']);
            $this->info("Updated user {$user->email} to care_home_admin");
        }
        
        $this->info('User roles fixed successfully!');
    }
}
