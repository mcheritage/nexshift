<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CareHomeManagementController extends Controller
{
    /**
     * Show all care homes
     */
    public function index(): Response
    {
        $careHomes = CareHome::with(['user', 'documents'])
            ->withCount(['documents', 'documents as approved_documents_count' => function ($query) {
                $query->where('status', 'approved');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/carehomes/index', [
            'careHomes' => $careHomes,
        ]);
    }

    /**
     * Show a specific care home
     */
    public function show(CareHome $careHome): Response
    {
        $careHome->load(['user', 'documents']);
        
        $documentStats = [
            'total' => $careHome->documents()->count(),
            'approved' => $careHome->documents()->where('status', 'approved')->count(),
            'pending' => $careHome->documents()->where('status', 'pending')->count(),
            'rejected' => $careHome->documents()->where('status', 'rejected')->count(),
            'requires_attention' => $careHome->documents()->where('status', 'requires_attention')->count(),
        ];

        return Inertia::render('admin/carehomes/show', [
            'careHome' => $careHome,
            'documentStats' => $documentStats,
        ]);
    }

    /**
     * Create a new care home
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'admin_first_name' => 'required|string|max:255',
            'admin_last_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        try {
            // Create care home
            $careHome = CareHome::create([
                'name' => $request->name,
            ]);

            // Create admin user for the care home
            $admin = User::create([
                'first_name' => $request->admin_first_name,
                'last_name' => $request->admin_last_name,
                'email' => $request->admin_email,
                'password' => Hash::make($request->admin_password),
                'role' => 'care_home_admin',
                'care_home_id' => $careHome->id,
                'email_verified_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Care home created successfully',
                'careHome' => $careHome->load('user'),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create care home: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a care home
     */
    public function update(Request $request, CareHome $careHome): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $careHome->update([
                'name' => $request->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Care home updated successfully',
                'careHome' => $careHome->load('user'),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update care home: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a care home
     */
    public function destroy(CareHome $careHome): JsonResponse
    {
        try {
            // Delete associated users
            $careHome->user()->delete();
            
            // Delete associated documents
            $careHome->documents()->delete();
            
            // Delete care home
            $careHome->delete();

            return response()->json([
                'success' => true,
                'message' => 'Care home deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete care home: ' . $e->getMessage(),
            ], 500);
        }
    }
}
