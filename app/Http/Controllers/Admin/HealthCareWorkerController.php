<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserStatusChanged;
use App\Models\CareHome;
use App\Models\StatusChange;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class HealthCareWorkerController extends Controller
{
    /**
     * Show all health care workers
     */
    public function index(): Response
    {
        $healthCareWorkers = User::where('role', 'health_worker')
            ->withCount([
                'documents',
                'documents as pending_documents_count' => function ($query) {
                    $query->where('status', 'pending');
                },
                'documents as approved_documents_count' => function ($query) {
                    $query->where('status', 'approved');
                },
                'documents as rejected_documents_count' => function ($query) {
                    $query->where('status', 'rejected');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $careHomes = CareHome::with('users')->get();

        return Inertia::render('admin/healthcare-workers/index', [
            'healthCareWorkers' => $healthCareWorkers,
            'careHomes' => $careHomes,
        ]);
    }

    /**
     * Show a specific health care worker
     */
    public function show(User $healthCareWorker): Response
    {
        $healthCareWorker->load(['care_home', 'statusChanges.changedBy']);

        return Inertia::render('admin/healthcare-workers/show', [
            'healthCareWorker' => $healthCareWorker,
        ]);
    }

    /**
     * Create a new health care worker
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'care_home_id' => 'required|exists:care_homes,id',
            'gender' => 'required|in:male,female,other',
        ]);

        try {
            $healthCareWorker = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'health_worker',
                'care_home_id' => $request->care_home_id,
                'gender' => $request->gender,
                'email_verified_at' => now(),
            ]);

            $healthCareWorker->load('care_home');

            // Log activity
            ActivityLogService::logUserCreated($healthCareWorker, $request->care_home_id);

            return response()->json([
                'success' => true,
                'message' => 'Health care worker created successfully',
                'healthCareWorker' => $healthCareWorker,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create health care worker: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a health care worker
     */
    public function update(Request $request, User $healthCareWorker): JsonResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $healthCareWorker->id,
            'care_home_id' => 'required|exists:care_homes,id',
            'gender' => 'required|in:male,female,other',
        ]);

        try {
            $oldData = [
                'first_name' => $healthCareWorker->first_name,
                'last_name' => $healthCareWorker->last_name,
                'email' => $healthCareWorker->email,
                'care_home_id' => $healthCareWorker->care_home_id,
                'gender' => $healthCareWorker->gender,
            ];
            
            $healthCareWorker->update([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'care_home_id' => $request->care_home_id,
                'gender' => $request->gender,
            ]);

            // Log activity
            ActivityLogService::logUserUpdated($healthCareWorker, [
                'old' => $oldData,
                'new' => $request->only(['first_name', 'last_name', 'email', 'care_home_id', 'gender']),
            ]);

            $healthCareWorker->load('care_home');

            return response()->json([
                'success' => true,
                'message' => 'Health care worker updated successfully',
                'healthCareWorker' => $healthCareWorker,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update health care worker: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update health care worker password
     */
    public function updatePassword(Request $request, User $healthCareWorker): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $healthCareWorker->update([
                'password' => Hash::make($request->password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a health care worker
     */
    public function destroy(User $healthCareWorker): JsonResponse
    {
        try {
            $userName = "{$healthCareWorker->first_name} {$healthCareWorker->last_name}";
            $userEmail = $healthCareWorker->email;
            $userId = $healthCareWorker->id;
            
            $healthCareWorker->delete();

            // Log activity
            ActivityLogService::logUserDeleted($userName, $userEmail, $userId);

            return response()->json([
                'success' => true,
                'message' => 'Health care worker deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete health care worker: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve a health care worker
     */
    public function approve(User $healthCareWorker)
    {
        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'action' => 'approve',
                'reason' => null,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'approved',
                'approve',
                null,
                $healthCareWorker->care_home_id
            );

            // Send email notification
            try {
                Mail::to($healthCareWorker->email)->send(
                    new UserStatusChanged($healthCareWorker, $oldStatus, 'approved', 'approve')
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send user status email', [
                    'error' => $e->getMessage(),
                    'user_email' => $healthCareWorker->email,
                ]);
            }

            return redirect()->back()->with('success', 'Healthcare worker approved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to approve healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Reject a health care worker
     */
    public function reject(Request $request, User $healthCareWorker)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'rejected',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'rejected',
                'action' => 'reject',
                'reason' => $request->reason,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'rejected',
                'reject',
                $request->reason,
                $healthCareWorker->care_home_id
            );

            // Send email notification
            try {
                Mail::to($healthCareWorker->email)->send(
                    new UserStatusChanged($healthCareWorker, $oldStatus, 'rejected', 'reject', $request->reason)
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send user status email', [
                    'error' => $e->getMessage(),
                    'user_email' => $healthCareWorker->email,
                ]);
            }

            return redirect()->back()->with('success', 'Healthcare worker rejected');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to reject healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Suspend a health care worker
     */
    public function suspend(Request $request, User $healthCareWorker)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'suspended',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'suspended',
                'action' => 'suspend',
                'reason' => $request->reason,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'suspended',
                'suspend',
                $request->reason,
                $healthCareWorker->care_home_id
            );

            return redirect()->back()->with('success', 'Healthcare worker suspended');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to suspend healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Unsuspend a health care worker
     */
    public function unsuspend(User $healthCareWorker)
    {
        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'approved',
                'rejection_reason' => null,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'action' => 'unsuspend',
                'reason' => null,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'approved',
                'unsuspend',
                null,
                $healthCareWorker->care_home_id
            );

            return redirect()->back()->with('success', 'Healthcare worker unsuspended');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to unsuspend healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }
}
