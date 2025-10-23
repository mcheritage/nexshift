<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApplicationController extends BaseApiController
{
    /**
     * Apply for a shift
     */
    public function store(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);
        
        // Only healthcare workers can apply for shifts
        if ($user->role !== 'health_worker') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'shift_id' => 'required|uuid|exists:shifts,id',
            'message' => 'nullable|string|max:1000',
        ]);

        $shift = Shift::findOrFail($request->shift_id);

        // Check if shift is available for applications
        if (!$shift->canAcceptApplications()) {
            return response()->json([
                'error' => 'This shift is no longer accepting applications'
            ], 400);
        }

        // Check if user has already applied for this shift
        $existingApplication = Application::where('shift_id', $shift->id)
            ->where('worker_id', $user->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'error' => 'You have already applied for this shift'
            ], 400);
        }

        // Create application
        $application = Application::create([
            'shift_id' => $shift->id,
            'worker_id' => $user->id,
            'message' => $request->message,
            'worker_skills' => $user->skills ?? [],
            'applied_at' => now(),
        ]);

        return response()->json([
            'message' => 'Application submitted successfully',
            'data' => [
                'id' => $application->id,
                'status' => $application->status,
                'applied_at' => $application->applied_at->format('Y-m-d H:i:s'),
            ]
        ], 201);
    }

    /**
     * Get user's applications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);
        
        // Only healthcare workers can view their applications
        if ($user->role !== 'health_worker') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $applications = Application::with(['shift.careHome'])
            ->where('worker_id', $user->id)
            ->orderBy('applied_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $applications->items(),
            'pagination' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
                'has_more' => $applications->hasMorePages(),
            ]
        ]);
    }

    /**
     * Withdraw an application
     */
    public function withdraw(Request $request, string $id): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);
        
        // Only healthcare workers can withdraw their applications
        if ($user->role !== 'health_worker') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $application = Application::where('id', $id)
            ->where('worker_id', $user->id)
            ->firstOrFail();

        if ($application->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot withdraw application that is not pending'
            ], 400);
        }

        $application->update([
            'status' => 'withdrawn',
            'withdrawn_at' => now(),
            'withdrawal_reason' => $request->input('reason', 'Withdrawn by user'),
        ]);

        return response()->json([
            'message' => 'Application withdrawn successfully'
        ]);
    }
}
