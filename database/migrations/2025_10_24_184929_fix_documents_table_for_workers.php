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
        Schema::table('documents', function (Blueprint $table) {
            // First, drop the foreign key constraint
            $table->dropForeign(['care_home_id']);
        });
        
        Schema::table('documents', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique(['care_home_id', 'document_type']);
        });
        
        Schema::table('documents', function (Blueprint $table) {
            // Make care_home_id nullable
            DB::statement('ALTER TABLE documents MODIFY care_home_id CHAR(36) NULL');
            
            // Re-add the foreign key without the unique constraint
            $table->foreign('care_home_id')->references('id')->on('care_homes')->onDelete('cascade');
            
            // Add user_id column if it doesn't exist
            if (!Schema::hasColumn('documents', 'user_id')) {
                $table->foreignUuid('user_id')->nullable()->after('care_home_id')->constrained()->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (Schema::hasColumn('documents', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
            
            // Make care_home_id not nullable again
            DB::statement('ALTER TABLE documents MODIFY care_home_id CHAR(36) NOT NULL');
        });
    }
};
