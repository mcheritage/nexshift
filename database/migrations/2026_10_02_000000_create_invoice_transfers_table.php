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
        // One row per worker on a Stripe-paid invoice: what they are owed and whether it has been sent
        Schema::create('invoice_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('worker_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('status'); // paid, held (worker not ready), failed (Stripe refused)
            $table->text('reason')->nullable(); // Why the transfer is held or failed
            $table->string('stripe_transfer_id')->nullable();
            $table->unsignedInteger('attempts')->default(0); // Transfers Stripe has refused so far
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['invoice_id', 'worker_id']);
            $table->index(['worker_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_transfers');
    }
};
