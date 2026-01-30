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
        Schema::create('timesheet_status_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('timesheet_id')->constrained('timesheets')->onDelete('cascade');
            $table->foreignUuid('changed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['draft', 'submitted', 'approved', 'queried', 'rejected', 'paid']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('timesheet_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheet_status_history');
    }
};
