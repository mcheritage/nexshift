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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('care_home_id')->constrained()->onDelete('cascade');
            $table->string('document_type'); // e.g., 'cqc_certificate', 'public_liability_insurance'
            $table->string('original_name'); // Original filename
            $table->string('file_path'); // Path to stored file
            $table->string('file_size'); // File size in bytes
            $table->string('mime_type'); // MIME type
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('rejection_reason')->nullable(); // Reason for rejection if applicable
            $table->timestamp('uploaded_at');
            $table->timestamps();
            
            // Ensure one document per type per care home
            $table->unique(['care_home_id', 'document_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
