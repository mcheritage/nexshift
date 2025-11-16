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
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type'); // User or CareHome
            $table->uuid('owner_id');
            $table->decimal('balance', 15, 2)->default(0.00);
            $table->decimal('total_credited', 15, 2)->default(0.00);
            $table->decimal('total_debited', 15, 2)->default(0.00);
            $table->string('currency', 3)->default('GBP');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['owner_type', 'owner_id']);
            $table->unique(['owner_type', 'owner_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
