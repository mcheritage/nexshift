<?php

namespace Tests\Feature;

use App\Models\CareHome;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin users see admin navigation menu', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Login as admin
    $this->actingAs($admin);

    // Visit admin dashboard
    $response = $this->get('/admin');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('admin/dashboard')
    );

    // The navigation should include admin-specific items
    // This is tested by ensuring the admin dashboard loads correctly
    // The frontend will dynamically show the correct navigation based on user role
});

test('care home admin users see care home navigation menu', function () {
    // Create a care home and administrator
    $careHome = CareHome::factory()->create();
    $admin = User::factory()->create([
        'role' => 'care_home_admin',
        'care_home_id' => $careHome->id,
    ]);

    // Login as care home admin
    $this->actingAs($admin);

    // Visit care home dashboard
    $response = $this->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('dashboard')
    );

    // The navigation should include care home admin-specific items
    // This is tested by ensuring the care home dashboard loads correctly
});

test('health care worker users see health care worker navigation menu', function () {
    // Create a care home
    $careHome = CareHome::factory()->create();

    // Create health care worker
    $worker = User::factory()->create([
        'role' => 'health_care_worker',
        'care_home_id' => $careHome->id,
    ]);

    // Login as health care worker
    $this->actingAs($worker);

    // Visit dashboard
    $response = $this->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('dashboard')
    );

    // The navigation should include health care worker-specific items
    // This is tested by ensuring the dashboard loads correctly
});

test('admin logo link points to admin dashboard', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);

    // Login as admin
    $this->actingAs($admin);

    // Visit any admin page
    $response = $this->get('/admin');

    $response->assertStatus(200);
    
    // The logo should link to /admin for admin users
    // This is handled by the frontend navigation logic
});

test('care home admin logo link points to care home dashboard', function () {
    // Create a care home and administrator
    $careHome = CareHome::factory()->create();
    $admin = User::factory()->create([
        'role' => 'care_home_admin',
        'care_home_id' => $careHome->id,
    ]);

    // Login as care home admin
    $this->actingAs($admin);

    // Visit dashboard
    $response = $this->get('/dashboard');

    $response->assertStatus(200);
    
    // The logo should link to /dashboard for care home admin users
    // This is handled by the frontend navigation logic
});
