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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('transaction_id')->unique();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['credit', 'debit']); // credit adds money, debit removes
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('category'); // manual_credit, manual_debit, invoice_payment, timesheet_payment, refund, etc
            $table->text('description');
            $table->text('reason')->nullable(); // Admin's reason for manual transactions
            $table->string('proof_file_path')->nullable(); // Path to uploaded proof document
            
            // Related entities
            $table->uuid('related_model_type')->nullable(); // Invoice, Timesheet, etc
            $table->uuid('related_model_id')->nullable();
            
            // Who performed the transaction
            $table->uuid('performed_by_id')->nullable();
            $table->string('performed_by_type')->nullable(); // User (admin, care_home, worker)
            
            // Payment/invoice specific
            $table->uuid('invoice_id')->nullable();
            $table->uuid('timesheet_id')->nullable();
            
            $table->string('status')->default('completed'); // completed, pending, failed, reversed
            $table->timestamp('completed_at')->nullable();
            $table->text('metadata')->nullable(); // JSON for additional data
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['wallet_id', 'type']);
            $table->index(['category']);
            $table->index(['invoice_id']);
            $table->index(['timesheet_id']);
            $table->index(['performed_by_id', 'performed_by_type']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
