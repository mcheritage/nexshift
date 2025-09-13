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
            $table->string('status')->default('pending')->change();
            $table->text('action_required')->nullable()->after('rejection_reason');
            $table->foreignUuid('reviewed_by')->nullable()->after('action_required');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            
//            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['action_required', 'reviewed_by', 'reviewed_at']);
            $table->string('status')->default('pending')->change();
        });
    }
};
