<?php

namespace Tests\Feature;

use App\DocumentVerificationStatus;
use App\Models\CareHome;
use App\Models\Document;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('care home administrator can view document verification status on dashboard', function () {
    // Create a care home and administrator
    $careHome = CareHome::factory()->create();
    $admin = User::factory()->create([
        'care_home_id' => $careHome->id,
        'role' => 'care_home_admin',
    ]);

    // Create some documents with different statuses
    Document::factory()->create([
        'care_home_id' => $careHome->id,
        'document_type' => 'cqc_certificate',
        'status' => DocumentVerificationStatus::PENDING,
    ]);

    Document::factory()->create([
        'care_home_id' => $careHome->id,
        'document_type' => 'public_liability_insurance',
        'status' => DocumentVerificationStatus::APPROVED,
    ]);

    Document::factory()->create([
        'care_home_id' => $careHome->id,
        'document_type' => 'business_license',
        'status' => DocumentVerificationStatus::REJECTED,
        'rejection_reason' => 'Document is not clear enough',
        'action_required' => 'Please upload a clearer version',
    ]);

    // Login as the administrator
    $this->actingAs($admin);

    // Visit the dashboard
    $response = $this->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('dashboard')
            ->has('careHome')
            ->has('documents')
            ->has('verificationStatuses')
            ->where('careHome.name', $careHome->name)
    );
});

test('admin can update document verification status', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Create a care home and administrator
    $careHome = CareHome::factory()->create();
    $careHomeAdmin = User::factory()->create([
        'care_home_id' => $careHome->id,
        'role' => 'care_home_admin',
    ]);

    // Create a document
    $document = Document::factory()->create([
        'care_home_id' => $careHome->id,
        'document_type' => 'cqc_certificate',
        'status' => DocumentVerificationStatus::PENDING,
    ]);

    // Login as admin
    $this->actingAs($admin);

    // Update document status
    $response = $this->patch("/admin/documents/{$document->id}/status", [
        'status' => 'rejected',
        'rejection_reason' => 'Document is not clear enough',
        'action_required' => 'Please upload a clearer version',
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    // Verify document was updated
    $document->refresh();
    expect($document->status)->toBe(DocumentVerificationStatus::REJECTED);
    expect($document->rejection_reason)->toBe('Document is not clear enough');
    expect($document->action_required)->toBe('Please upload a clearer version');
    expect($document->reviewed_by)->toBe($admin->id);

    // Verify notification was created
    $notification = Notification::where('user_id', $careHomeAdmin->id)->first();
    expect($notification)->not->toBeNull();
    expect($notification->type)->toBe('document_status_changed');
    expect($notification->title)->toBe('Document Status Updated');
});

test('care home administrator receives notification when document status changes', function () {
    // Create a care home and administrator
    $careHome = CareHome::factory()->create();
    $admin = User::factory()->create([
        'care_home_id' => $careHome->id,
        'role' => 'care_home_admin',
    ]);

    // Create a document
    $document = Document::factory()->create([
        'care_home_id' => $careHome->id,
        'document_type' => 'cqc_certificate',
        'status' => DocumentVerificationStatus::PENDING,
    ]);

    // Create admin user
    $systemAdmin = User::factory()->create(['role' => 'admin']);

    // Login as system admin
    $this->actingAs($systemAdmin);

    // Update document status
    $this->patch("/admin/documents/{$document->id}/status", [
        'status' => 'requires_attention',
        'action_required' => 'Please provide additional documentation',
    ]);

    // Login as care home administrator
    $this->actingAs($admin);

    // Visit dashboard and check for notification
    $response = $this->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->has('notifications')
            ->where('notifications.0.type', 'document_status_changed')
            ->where('notifications.0.title', 'Document Status Updated')
    );
});

test('document verification status enum provides correct metadata', function () {
    $statuses = DocumentVerificationStatus::cases();
    
    expect($statuses)->toHaveCount(4);
    
    // Test pending status
    $pending = DocumentVerificationStatus::PENDING;
    expect($pending->getDisplayName())->toBe('Pending Review');
    expect($pending->getColor())->toBe('yellow');
    expect($pending->getIcon())->toBe('clock');
    expect($pending->isActionRequired())->toBeFalse();
    
    // Test approved status
    $approved = DocumentVerificationStatus::APPROVED;
    expect($approved->getDisplayName())->toBe('Approved');
    expect($approved->getColor())->toBe('green');
    expect($approved->getIcon())->toBe('check-circle');
    expect($approved->isActionRequired())->toBeFalse();
    
    // Test rejected status
    $rejected = DocumentVerificationStatus::REJECTED;
    expect($rejected->getDisplayName())->toBe('Rejected');
    expect($rejected->getColor())->toBe('red');
    expect($rejected->getIcon())->toBe('x-circle');
    expect($rejected->isActionRequired())->toBeTrue();
    
    // Test requires attention status
    $requiresAttention = DocumentVerificationStatus::REQUIRES_ATTENTION;
    expect($requiresAttention->getDisplayName())->toBe('Requires Attention');
    expect($requiresAttention->getColor())->toBe('orange');
    expect($requiresAttention->getIcon())->toBe('alert-triangle');
    expect($requiresAttention->isActionRequired())->toBeTrue();
});
