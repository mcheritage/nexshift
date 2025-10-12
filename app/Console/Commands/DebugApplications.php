<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DebugApplications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:debug-applications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug application counts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $applications = \App\Models\Application::with(['shift', 'worker'])->get();
        
        $this->info('Total applications: ' . $applications->count());
        $this->newLine();
        
        if ($applications->count() > 0) {
            $this->info('Applications by shift:');
            $grouped = $applications->groupBy('shift_id');
            
            foreach ($grouped as $shiftId => $apps) {
                $shift = $apps->first()->shift;
                $this->info("Shift: {$shift->title} (ID: {$shiftId})");
                $this->info("  Applications: {$apps->count()}");
                
                foreach ($apps as $app) {
                    $this->info("    - {$app->worker->name} ({$app->status})");
                }
                $this->newLine();
            }
        } else {
            $this->warn('No applications found in database');
        }
        
        // Also check shift application counts with more details
        $shifts = \App\Models\Shift::withCount('applications')->get();
        $this->info('All shifts with application counts:');
        foreach ($shifts as $shift) {
            $this->info("  ID: {$shift->id}");
            $this->info("  Title: {$shift->title}");
            $this->info("  Status: {$shift->status}");
            $this->info("  Applications Count: {$shift->applications_count}");
            $this->newLine();
        }
        
        return Command::SUCCESS;
    }
}
