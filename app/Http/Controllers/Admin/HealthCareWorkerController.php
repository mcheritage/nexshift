<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class HealthCareWorkerController extends Controller
{
    /**
     * Show all health care workers
     */
    public function index(): Response
    {
        $healthCareWorkers = User::where('role', 'health_care_worker')
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

        $careHomes = CareHome::with('user')->get();

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
        $healthCareWorker->load('care_home');

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
                'role' => 'health_care_worker',
                'care_home_id' => $request->care_home_id,
                'gender' => $request->gender,
                'email_verified_at' => now(),
            ]);

            $healthCareWorker->load('care_home');

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
            $healthCareWorker->update([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'care_home_id' => $request->care_home_id,
                'gender' => $request->gender,
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
            $healthCareWorker->delete();

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
}
