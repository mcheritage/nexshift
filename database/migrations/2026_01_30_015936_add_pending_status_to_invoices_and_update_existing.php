<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, alter the enum to add 'pending' status
        DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'pending'");
        
        // Then update all existing draft invoices to pending
        DB::table('invoices')
            ->where('status', 'draft')
            ->update(['status' => 'pending']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert pending invoices back to draft
        DB::table('invoices')
            ->where('status', 'pending')
            ->update(['status' => 'draft']);
            
        // Revert back to original enum
        DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft'");
    }
};
