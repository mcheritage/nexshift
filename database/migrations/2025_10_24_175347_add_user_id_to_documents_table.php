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
        Schema::table('documents', function (Blueprint $table) {
            // Make care_home_id nullable since worker documents won't have this
            $table->foreignUuid('care_home_id')->nullable()->change();
            
            // Add user_id for worker documents (UUID to match users table)
            $table->foreignUuid('user_id')->nullable()->after('care_home_id')->constrained()->onDelete('cascade');
            
            // Drop the unique constraint on care_home_id and document_type
            $table->dropUnique(['care_home_id', 'document_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            
            $table->foreignUuid('care_home_id')->nullable(false)->change();
            
            // Re-add the unique constraint
            $table->unique(['care_home_id', 'document_type']);
        });
    }
};
