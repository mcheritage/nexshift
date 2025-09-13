<?php

namespace Tests\Feature;

use App\Models\CareHome;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can access admin dashboard', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Login as admin
    $this->actingAs($admin);

    // Visit admin dashboard
    $response = $this->get('/admin');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('admin/dashboard')
            ->has('stats')
            ->has('recentDocuments')
            ->has('recentCareHomes')
            ->has('recentUsers')
    );
});

test('admin can view all care homes', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Create some care homes
    $careHome1 = CareHome::factory()->create();
    $careHome2 = CareHome::factory()->create();

    // Login as admin
    $this->actingAs($admin);

    // Visit care homes management page
    $response = $this->get('/admin/carehomes');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('admin/carehomes/index')
            ->has('careHomes')
            ->where('careHomes.0.name', $careHome1->name)
            ->where('careHomes.1.name', $careHome2->name)
    );
});

test('admin can create a new care home', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Login as admin
    $this->actingAs($admin);

    // Create care home
    $response = $this->post('/admin/carehomes', [
        'name' => 'Test Care Home',
        'admin_first_name' => 'John',
        'admin_last_name' => 'Doe',
        'admin_email' => 'john@testcarehome.com',
        'admin_password' => 'password123',
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    // Verify care home was created
    $this->assertDatabaseHas('care_homes', [
        'name' => 'Test Care Home',
    ]);

    // Verify admin user was created
    $this->assertDatabaseHas('users', [
        'email' => 'john@testcarehome.com',
        'role' => 'care_home_admin',
    ]);
});

test('admin can view all health care workers', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Create care home
    $careHome = CareHome::factory()->create();

    // Create health care workers
    $worker1 = User::factory()->create([
        'role' => 'health_care_worker',
        'care_home_id' => $careHome->id,
    ]);
    $worker2 = User::factory()->create([
        'role' => 'health_care_worker',
        'care_home_id' => $careHome->id,
    ]);

    // Login as admin
    $this->actingAs($admin);

    // Visit health care workers management page
    $response = $this->get('/admin/healthcare-workers');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('admin/healthcare-workers/index')
            ->has('healthCareWorkers')
            ->has('careHomes')
    );
});

test('admin can create a new health care worker', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Create care home
    $careHome = CareHome::factory()->create();

    // Login as admin
    $this->actingAs($admin);

    // Create health care worker
    $response = $this->post('/admin/healthcare-workers', [
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'email' => 'jane@testcarehome.com',
        'password' => 'password123',
        'care_home_id' => $careHome->id,
        'gender' => 'female',
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    // Verify health care worker was created
    $this->assertDatabaseHas('users', [
        'email' => 'jane@testcarehome.com',
        'role' => 'health_care_worker',
        'care_home_id' => $careHome->id,
    ]);
});

test('admin can access document verification', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Login as admin
    $this->actingAs($admin);

    // Visit document verification page
    $response = $this->get('/admin/documents');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('admin/document-verification')
            ->has('careHomes')
            ->has('documentStats')
            ->has('verificationStatuses')
    );
});

test('non-admin users cannot access admin routes', function () {
    // Create regular user
    $user = User::factory()->create(['role' => 'care_home_admin']);

    // Login as regular user
    $this->actingAs($user);

    // Try to access admin dashboard
    $response = $this->get('/admin');

    $response->assertStatus(403);
});
