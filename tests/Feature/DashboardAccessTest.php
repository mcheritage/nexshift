<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin users are redirected to admin dashboard when accessing main dashboard', function () {
    // Create admin user
    $admin = User::factory()->admin()->create();

    // Login as admin
    $this->actingAs($admin);

    // Visit the main dashboard
    $response = $this->get('/dashboard');

    // Should be redirected to admin dashboard
    $response->assertRedirect('/admin');
});

test('care home admin users see the care home dashboard', function () {
    // Create a care home and administrator
    $careHome = \App\Models\CareHome::factory()->create();
    $admin = User::factory()->create([
        'care_home_id' => $careHome->id,
        'role' => 'care_home_admin',
    ]);

    // Login as care home administrator
    $this->actingAs($admin);

    // Visit the dashboard
    $response = $this->get('/dashboard');

    // Should see the care home dashboard
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('dashboard')
            ->has('careHome')
            ->where('careHome.name', $careHome->name)
    );
});
