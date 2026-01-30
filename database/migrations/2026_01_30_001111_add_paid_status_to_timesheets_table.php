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
        // Modify the status column to include 'paid'
        DB::statement("ALTER TABLE timesheets MODIFY COLUMN status ENUM('draft', 'submitted', 'approved', 'queried', 'rejected', 'paid') NOT NULL DEFAULT 'draft'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original status values
        DB::statement("ALTER TABLE timesheets MODIFY COLUMN status ENUM('draft', 'submitted', 'approved', 'queried', 'rejected') NOT NULL DEFAULT 'draft'");
    }
};
