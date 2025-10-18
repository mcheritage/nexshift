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
        Schema::create('shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('care_home_id')->constrained('care_homes')->onDelete('cascade');
            
            // Shift Details
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('role', [
                'registered_nurse', 
                'healthcare_assistant', 
                'support_worker',
                'senior_care_worker',
                'night_shift_worker',
                'bank_staff'
            ]);
            
            // Date and Time
            $table->date('shift_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('duration_hours', 4, 2); // Calculated field
            
            // Compensation
            $table->decimal('hourly_rate', 8, 2);
            $table->decimal('total_pay', 10, 2)->nullable(); // Calculated: hourly_rate * duration_hours
            
            // Requirements and Skills
            $table->json('required_skills')->nullable(); // Store as JSON array
            $table->json('required_qualifications')->nullable(); // NMC PIN, Care Certificate, etc.
            $table->text('special_requirements')->nullable(); // Additional notes
            
            // Status and Management
            $table->enum('status', [
                'draft',
                'published', 
                'filled',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('draft');
            
            $table->integer('max_applicants')->default(1);
            $table->boolean('is_urgent')->default(false);
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_pattern')->nullable(); // weekly, monthly, etc.
            
            // Application and Selection
            $table->foreignUuid('selected_worker_id')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('application_deadline')->nullable();
            $table->datetime('published_at')->nullable();
            $table->datetime('filled_at')->nullable();
            $table->datetime('completed_at')->nullable();
            
            // Metadata
            $table->foreignUuid('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['care_home_id', 'status']);
            $table->index(['shift_date', 'status']);
            $table->index(['role', 'status']);
            $table->index(['published_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
