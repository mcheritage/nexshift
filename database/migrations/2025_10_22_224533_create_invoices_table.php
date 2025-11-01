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
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('care_home_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number')->unique(); // e.g., INV-2025-001
            $table->date('invoice_date');
            $table->date('period_start'); // Start of billing period
            $table->date('period_end'); // End of billing period
            $table->decimal('subtotal', 10, 2); // Total before tax
            $table->decimal('tax_rate', 5, 2)->default(0); // Tax percentage
            $table->decimal('tax_amount', 10, 2)->default(0); // Tax amount
            $table->decimal('total', 10, 2); // Total including tax
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->date('due_date')->nullable();
            $table->date('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('care_home_id');
            $table->index('invoice_number');
            $table->index('status');
            $table->index('invoice_date');
        });

        // Pivot table for invoice-timesheet relationship
        Schema::create('invoice_timesheet', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('timesheet_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['invoice_id', 'timesheet_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
