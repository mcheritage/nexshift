<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Document;
use App\Models\StatusChange;
use App\Models\User;
use App\Services\ActivityLogService;
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
        $careHomes = CareHome::with(['users', 'documents'])
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
        $careHome->load(['users', 'documents', 'statusChanges.changedBy']);
        
        $totalRequired = 18; // Based on DocumentType::getAllRequired()
        
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
            'totalRequired' => $totalRequired,
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

            // Log activities
            ActivityLogService::logCareHomeCreated($careHome);
            ActivityLogService::logUserCreated($admin, $careHome->id);

            return response()->json([
                'success' => true,
                'message' => 'Care home created successfully',
                'careHome' => $careHome->load('users'),
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
            $oldName = $careHome->name;
            
            $careHome->update([
                'name' => $request->name,
            ]);

            // Log activity
            ActivityLogService::logCareHomeUpdated($careHome, [
                'old_name' => $oldName,
                'new_name' => $request->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Care home updated successfully',
                'careHome' => $careHome->load('users'),
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
            $careHomeName = $careHome->name;
            $careHomeId = $careHome->id;
            
            // Delete associated users
            $careHome->users()->delete();
            
            // Delete associated documents
            $careHome->documents()->delete();
            
            // Delete care home
            $careHome->delete();

            // Log activity
            ActivityLogService::logCareHomeDeleted($careHomeName, $careHomeId);

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

    /**
     * Approve a care home
     */
    public function approve(CareHome $careHome)
    {
        try {
            $oldStatus = $careHome->status;
            
            $careHome->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => CareHome::class,
                'model_id' => $careHome->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'action' => 'approve',
                'reason' => null,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $careHome,
                $oldStatus,
                'approved',
                'approve',
                null,
                $careHome->id
            );

            return redirect()->back()->with('success', 'Care home approved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to approve care home: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Reject a care home
     */
    public function reject(Request $request, CareHome $careHome)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $oldStatus = $careHome->status;
            
            $careHome->update([
                'status' => 'rejected',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => CareHome::class,
                'model_id' => $careHome->id,
                'old_status' => $oldStatus,
                'new_status' => 'rejected',
                'action' => 'reject',
                'reason' => $request->reason,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $careHome,
                $oldStatus,
                'rejected',
                'reject',
                $request->reason,
                $careHome->id
            );

            return redirect()->back()->with('success', 'Care home rejected');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to reject care home: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Suspend a care home
     */
    public function suspend(Request $request, CareHome $careHome)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $oldStatus = $careHome->status;
            
            $careHome->update([
                'status' => 'suspended',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => CareHome::class,
                'model_id' => $careHome->id,
                'old_status' => $oldStatus,
                'new_status' => 'suspended',
                'action' => 'suspend',
                'reason' => $request->reason,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $careHome,
                $oldStatus,
                'suspended',
                'suspend',
                $request->reason,
                $careHome->id
            );

            return redirect()->back()->with('success', 'Care home suspended');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to suspend care home: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Unsuspend a care home
     */
    public function unsuspend(Request $request, CareHome $careHome)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $oldStatus = $careHome->status;
            
            $careHome->update([
                'status' => 'approved',
                'rejection_reason' => null,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => CareHome::class,
                'model_id' => $careHome->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'action' => 'unsuspend',
                'reason' => null,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $careHome,
                $oldStatus,
                'approved',
                'unsuspend',
                null,
                $careHome->id
            );

            return redirect()->back()->with('success', 'Care home unsuspended');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to unsuspend care home: ' . $e->getMessage(),
            ]);
        }
    }
}
