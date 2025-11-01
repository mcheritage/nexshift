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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable(); // Who performed the action
            $table->uuid('care_home_id')->nullable(); // Which care home this relates to
            $table->string('action'); // e.g., 'shift_cancelled', 'shift_created', etc.
            $table->string('subject_type')->nullable(); // Model type (e.g., 'App\Models\Shift')
            $table->uuid('subject_id')->nullable(); // Model ID
            $table->text('description'); // Human-readable description
            $table->json('properties')->nullable(); // Additional data
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('care_home_id')->references('id')->on('care_homes')->onDelete('cascade');
            $table->index(['subject_type', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
