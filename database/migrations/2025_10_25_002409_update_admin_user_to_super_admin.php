<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update admin@nexshift.com to be super admin
        User::where('email', 'admin@nexshift.com')->update([
            'is_admin' => 1,
            'role' => 'super_admin',
            'care_home_id' => null,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the changes
        User::where('email', 'admin@nexshift.com')->update([
            'is_admin' => 0,
            'role' => 'admin',
        ]);
    }
};
