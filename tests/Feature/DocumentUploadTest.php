<?php

use App\Models\User;
use App\Models\CareHome;
use App\Models\Document;
use App\DocumentType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('private');
});

test('care home admin can view document upload page', function () {
    $careHome = CareHome::factory()->create();
    $user = User::factory()->create(['care_home_id' => $careHome->id]);

    $response = $this->actingAs($user)->get(route('documents.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('carehome/document-upload')
            ->has('requiredDocuments')
            ->has('uploadedDocuments')
            ->has('careHome')
    );
});

test('care home admin can upload a document', function () {
    $careHome = CareHome::factory()->create();
    $user = User::factory()->create(['care_home_id' => $careHome->id]);

    $file = UploadedFile::fake()->create('test.pdf', 1000, 'application/pdf');

    $response = $this->actingAs($user)->post(route('documents.upload'), [
        'document_type' => DocumentType::CQC_CERTIFICATE->value,
        'file' => $file,
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    $this->assertDatabaseHas('documents', [
        'care_home_id' => $careHome->id,
        'document_type' => DocumentType::CQC_CERTIFICATE->value,
        'original_name' => 'test.pdf',
        'status' => 'pending',
    ]);

    Storage::disk('private')->assertExists('documents/carehomes/' . $careHome->id . '/' . basename($response->json('document.file_path')));
});

test('care home admin cannot upload invalid file type', function () {
    $careHome = CareHome::factory()->create();
    $user = User::factory()->create(['care_home_id' => $careHome->id]);

    $file = UploadedFile::fake()->create('test.txt', 1000, 'text/plain');

    $response = $this->actingAs($user)->post(route('documents.upload'), [
        'document_type' => DocumentType::CQC_CERTIFICATE->value,
        'file' => $file,
    ]);

    $response->assertStatus(302); // Redirect back with validation errors
    $response->assertSessionHasErrors(['file']);
});

test('care home admin cannot upload file exceeding size limit', function () {
    $careHome = CareHome::factory()->create();
    $user = User::factory()->create(['care_home_id' => $careHome->id]);

    $file = UploadedFile::fake()->create('test.pdf', 15000, 'application/pdf'); // 15MB

    $response = $this->actingAs($user)->post(route('documents.upload'), [
        'document_type' => DocumentType::CQC_CERTIFICATE->value,
        'file' => $file,
    ]);

    $response->assertStatus(302); // Redirect back with validation errors
    $response->assertSessionHasErrors(['file']);
});

test('care home admin can delete uploaded document', function () {
    $careHome = CareHome::factory()->create();
    $user = User::factory()->create(['care_home_id' => $careHome->id]);
    
    $document = Document::factory()->create([
        'care_home_id' => $careHome->id,
        'document_type' => DocumentType::CQC_CERTIFICATE->value,
    ]);

    $response = $this->actingAs($user)->delete(route('documents.delete'), [
        'document_id' => $document->id,
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    $this->assertDatabaseMissing('documents', ['id' => $document->id]);
});

test('care home admin can download uploaded document', function () {
    $careHome = CareHome::factory()->create();
    $user = User::factory()->create(['care_home_id' => $careHome->id]);
    
    $document = Document::factory()->create([
        'care_home_id' => $careHome->id,
        'document_type' => DocumentType::CQC_CERTIFICATE->value,
    ]);

    // Create a fake file
    Storage::disk('private')->put($document->file_path, 'fake file content');

    $response = $this->actingAs($user)->get(route('documents.download', $document));

    $response->assertStatus(200);
    $response->assertHeader('content-disposition');
});

test('unauthorized user cannot access document upload page', function () {
    $response = $this->get(route('documents.index'));

    $response->assertRedirect(route('login'));
});

test('user without care home cannot access document upload page', function () {
    $user = User::factory()->create(['care_home_id' => null]);

    $response = $this->actingAs($user)->get(route('documents.index'));

    $response->assertRedirect(route('register.carehome'));
});
