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
            // Worker profile fields
            $table->string('phone_number')->nullable()->after('email');
            $table->text('bio')->nullable()->after('phone_number');
            $table->json('qualifications')->nullable()->after('bio'); // Store as JSON array
            $table->json('certifications')->nullable()->after('qualifications'); // Store as JSON array
            $table->integer('years_experience')->nullable()->after('certifications');
            $table->json('skills')->nullable()->after('years_experience'); // Store as JSON array
            $table->string('profile_photo')->nullable()->after('skills');
            $table->decimal('hourly_rate_min', 8, 2)->nullable()->after('profile_photo');
            $table->decimal('hourly_rate_max', 8, 2)->nullable()->after('hourly_rate_min');
            $table->boolean('available_weekends')->default(false)->after('hourly_rate_max');
            $table->boolean('available_nights')->default(false)->after('available_weekends');
            $table->text('additional_notes')->nullable()->after('available_nights');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone_number',
                'bio', 
                'qualifications',
                'certifications',
                'years_experience',
                'skills',
                'profile_photo',
                'hourly_rate_min',
                'hourly_rate_max',
                'available_weekends',
                'available_nights',
                'additional_notes'
            ]);
        });
    }
};
