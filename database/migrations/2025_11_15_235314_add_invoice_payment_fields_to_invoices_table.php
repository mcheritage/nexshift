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
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('paid_at'); // wallet, bank_transfer, etc
            $table->uuid('transaction_id')->nullable()->after('payment_method'); // Link to transaction
            $table->uuid('paid_by_user_id')->nullable()->after('transaction_id');
            $table->text('payment_notes')->nullable()->after('paid_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'transaction_id', 'paid_by_user_id', 'payment_notes']);
        });
    }
};
