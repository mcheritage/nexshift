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
        Schema::create('bank_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->string('account_holder_name');
            $table->string('sort_code', 6); // UK sort code format
            $table->string('account_number', 8); // UK account number format
            $table->string('bank_name')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('is_verified');
            
            // Unique constraint: one bank detail per user
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_details');
    }
};