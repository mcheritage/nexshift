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
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Foreign keys
            $table->foreignUuid('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->foreignUuid('worker_id')->constrained('users')->onDelete('cascade');
            
            // Application details
            $table->enum('status', ['pending', 'accepted', 'rejected', 'withdrawn'])->default('pending');
            $table->text('message')->nullable(); // Optional cover message from worker
            $table->json('worker_skills')->nullable(); // Skills at time of application
            
            // Review tracking
            $table->timestamp('applied_at');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('review_notes')->nullable(); // Care home's notes on decision
            
            // Automatic withdrawal tracking
            $table->timestamp('withdrawn_at')->nullable();
            $table->text('withdrawal_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['shift_id', 'status']);
            $table->index(['worker_id', 'status']);
            $table->index('applied_at');
            
            // Unique constraint: one application per worker per shift
            $table->unique(['shift_id', 'worker_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
