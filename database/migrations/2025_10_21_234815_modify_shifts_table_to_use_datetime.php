<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            // Add new datetime columns only if they don't exist
            if (!Schema::hasColumn('shifts', 'start_datetime')) {
                $table->datetime('start_datetime')->nullable()->after('shift_date');
            }
            if (!Schema::hasColumn('shifts', 'end_datetime')) {
                $table->datetime('end_datetime')->nullable()->after('start_datetime');
            }
        });
        
        // Migrate existing data
        $this->migrateExistingData();
        
        // Now drop the old columns if they exist
        Schema::table('shifts', function (Blueprint $table) {
            if (Schema::hasColumn('shifts', 'start_time')) {
                $table->dropColumn('start_time');
            }
            if (Schema::hasColumn('shifts', 'end_time')) {
                $table->dropColumn('end_time');
            }
            if (Schema::hasColumn('shifts', 'ends_next_day')) {
                $table->dropColumn('ends_next_day');
            }
        });
        
        // Make the new columns non-nullable
        Schema::table('shifts', function (Blueprint $table) {
            $table->datetime('start_datetime')->nullable(false)->change();
            $table->datetime('end_datetime')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            // Re-add the old columns
            $table->time('start_time')->after('shift_date');
            $table->time('end_time')->after('start_time');
            $table->boolean('ends_next_day')->default(false)->after('end_time');
            
            // Drop the new columns
            $table->dropColumn(['start_datetime', 'end_datetime']);
        });
    }
    
    /**
     * Migrate existing time data to datetime format
     */
    private function migrateExistingData(): void
    {
        // Get raw data without going through model accessors
        $shifts = \DB::table('shifts')->get();
        
        foreach ($shifts as $shift) {
            try {
                // Handle different time formats (H:i:s or H:i)
                $startTime = $shift->start_time;
                $endTime = $shift->end_time;
                
                // If time includes seconds, strip them
                if (substr_count($startTime, ':') === 2) {
                    $startTime = substr($startTime, 0, 5); // Get only HH:MM
                }
                if (substr_count($endTime, ':') === 2) {
                    $endTime = substr($endTime, 0, 5); // Get only HH:MM
                }
                
                // Create start datetime by combining shift_date and start_time
                $startDatetime = \Carbon\Carbon::createFromFormat(
                    'Y-m-d H:i', 
                    $shift->shift_date . ' ' . $startTime
                );
                
                // Create end datetime 
                $endDatetime = \Carbon\Carbon::createFromFormat(
                    'Y-m-d H:i', 
                    $shift->shift_date . ' ' . $endTime
                );
                
                // If ends_next_day is true, add one day to end datetime
                if ($shift->ends_next_day) {
                    $endDatetime->addDay();
                }
                
                // Update the shift with new datetime values using raw query
                \DB::table('shifts')
                    ->where('id', $shift->id)
                    ->update([
                        'start_datetime' => $startDatetime->format('Y-m-d H:i:s'),
                        'end_datetime' => $endDatetime->format('Y-m-d H:i:s'),
                    ]);
                    
            } catch (\Exception $e) {
                echo "Error migrating shift {$shift->id}: " . $e->getMessage() . "\n";
                echo "Start time: {$shift->start_time}, End time: {$shift->end_time}\n";
            }
        }
    }
};
