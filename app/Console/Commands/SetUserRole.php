<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SetUserRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:set-user-role {email} {role=health_care_worker}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set role for a specific user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $role = $this->argument('role');

        $validRoles = ['health_care_worker', 'care_home_admin', 'admin'];
        
        if (!in_array($role, $validRoles)) {
            $this->error("Invalid role. Valid roles are: " . implode(', ', $validRoles));
            return Command::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return Command::FAILURE;
        }

        $user->role = $role;
        $user->save();

        $this->info("User '{$email}' role set to '{$role}' successfully!");
        return Command::SUCCESS;
    }
}
