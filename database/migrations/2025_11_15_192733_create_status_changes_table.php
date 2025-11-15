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
        Schema::create('status_changes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('model_type'); // CareHome or User (healthcare worker)
            $table->uuid('model_id'); // ID of the care home or user
            $table->string('old_status')->nullable();
            $table->string('new_status');
            $table->string('action'); // approve, reject, suspend, unsuspend
            $table->text('reason')->nullable(); // Reason for the status change
            $table->uuid('changed_by'); // Admin who made the change
            $table->timestamps();

            $table->index(['model_type', 'model_id']);
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_changes');
    }
};
