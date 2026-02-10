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
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_account_id')->nullable()->after('bio');
            $table->boolean('stripe_onboarding_complete')->default(false)->after('stripe_account_id');
            $table->string('stripe_account_type')->nullable()->after('stripe_onboarding_complete');
            $table->timestamp('stripe_connected_at')->nullable()->after('stripe_account_type');
            $table->boolean('stripe_charges_enabled')->default(false)->after('stripe_connected_at');
            $table->boolean('stripe_payouts_enabled')->default(false)->after('stripe_charges_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_account_id',
                'stripe_onboarding_complete',
                'stripe_account_type',
                'stripe_connected_at',
                'stripe_charges_enabled',
                'stripe_payouts_enabled',
            ]);
        });
    }
};
