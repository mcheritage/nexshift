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
        Schema::create('timesheets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('shift_id');
            $table->uuid('worker_id');
            $table->uuid('care_home_id');
            
            // Time tracking
            $table->dateTime('clock_in_time');
            $table->dateTime('clock_out_time')->nullable();
            $table->integer('break_duration_minutes')->default(0);
            $table->decimal('total_hours', 8, 2)->nullable();
            
            // Rate and pay calculation
            $table->decimal('hourly_rate', 8, 2);
            $table->decimal('total_pay', 10, 2)->nullable();
            
            // Status and approval
            $table->enum('status', ['draft', 'submitted', 'approved', 'queried', 'rejected'])->default('draft');
            
            // Notes and feedback
            $table->text('worker_notes')->nullable();
            $table->text('manager_notes')->nullable();
            
            // Approval tracking
            $table->uuid('approved_by')->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('submitted_at')->nullable();
            
            // Additional fields
            $table->boolean('has_overtime')->default(false);
            $table->decimal('overtime_hours', 8, 2)->default(0);
            $table->decimal('overtime_rate', 8, 2)->nullable();
            
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('shift_id')->references('id')->on('shifts')->onDelete('cascade');
            $table->foreign('worker_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('care_home_id')->references('id')->on('care_homes')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index(['care_home_id', 'status']);
            $table->index(['worker_id', 'status']);
            $table->index('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheets');
    }
};
