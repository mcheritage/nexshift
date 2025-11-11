<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Shift;
use App\UserRoles;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ApplicationController extends BaseApiController
{
    /**
     * Apply for a shift
     */
    public function store(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);
        
        // Only healthcare workers can apply for shifts
        if ($user->role !== UserRoles::HEALTH_WORKER) {
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

        // Load the application with relationships
        $application->load(['shift.careHome', 'shift.selectedWorker']);

        return response()->json([
            'message' => 'Application submitted successfully',
            'data' => [
                'id' => $application->id,
                'shift_id' => $application->shift_id,
                'worker_id' => $application->worker_id,
                'status' => $application->status,
                'status_display' => $application->status_display,
                'message' => $application->message,
                'applied_at' => $application->applied_at->format('Y-m-d H:i:s'),
                'reviewed_at' => $application->reviewed_at?->format('Y-m-d H:i:s'),
                'reviewed_by' => $application->reviewed_by,
                'rejection_reason' => $application->rejection_reason,
                'created_at' => $application->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $application->updated_at->format('Y-m-d H:i:s'),
                'shift' => [
                    'id' => $application->shift->id,
                    'title' => $application->shift->title,
                    'description' => $application->shift->description,
                    'role' => $application->shift->role,
                    'role_display' => $application->shift->role_display,
                    'shift_date' => $application->shift->shift_date->format('Y-m-d'),
                    'start_time' => $application->shift->start_time,
                    'end_time' => $application->shift->end_time,
                    'duration_hours' => (float) $application->shift->duration_hours,
                    'hourly_rate' => (float) $application->shift->hourly_rate,
                    'total_pay' => (float) $application->shift->total_pay,
                    'required_skills' => $application->shift->required_skills,
                    'required_qualifications' => $application->shift->required_qualifications,
                    'special_requirements' => $application->shift->special_requirements,
                    'status' => $application->shift->status,
                    'status_display' => $application->shift->status_display,
                    'max_applicants' => $application->shift->max_applicants,
                    'is_urgent' => $application->shift->is_urgent,
                    'is_recurring' => $application->shift->is_recurring,
                    'recurrence_pattern' => $application->shift->recurrence_pattern,
                    'application_deadline' => $application->shift->application_deadline?->format('Y-m-d H:i:s'),
                    'published_at' => $application->shift->published_at?->format('Y-m-d H:i:s'),
                    'created_at' => $application->shift->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $application->shift->updated_at->format('Y-m-d H:i:s'),
                    'care_home' => [
                        'id' => $application->shift->careHome->id,
                        'name' => $application->shift->careHome->name,
                    ],
                    'selected_worker' => $application->shift->selectedWorker ? [
                        'id' => $application->shift->selectedWorker->id,
                        'name' => $application->shift->selectedWorker->first_name . ' ' . $application->shift->selectedWorker->last_name,
                        'email' => $application->shift->selectedWorker->email,
                    ] : null,
                    'is_available' => $application->shift->isAvailable(),
                    'can_accept_applications' => $application->shift->canAcceptApplications(),
                    'is_urgent_by_time' => $application->shift->isUrgent(),
                    'start_date_time' => $application->shift->start_date_time,
                    'end_date_time' => $application->shift->end_date_time,
                ],
            ]
        ], 201);
    }

    /**
     * Get user's applications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        $applications = Application::with(['shift.careHome', 'shift.selectedWorker'])
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
        if ($user->role !== UserRoles::HEALTH_WORKER) {
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

        // Load the application with relationships
        $application->load(['shift.careHome', 'shift.selectedWorker']);

        return response()->json([
            'message' => 'Application withdrawn successfully',
            'data' => [
                'id' => $application->id,
                'shift_id' => $application->shift_id,
                'worker_id' => $application->worker_id,
                'status' => $application->status,
                'status_display' => $application->status_display,
                'message' => $application->message,
                'applied_at' => $application->applied_at->format('Y-m-d H:i:s'),
                'reviewed_at' => $application->reviewed_at?->format('Y-m-d H:i:s'),
                'reviewed_by' => $application->reviewed_by,
                'rejection_reason' => $application->rejection_reason,
                'created_at' => $application->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $application->updated_at->format('Y-m-d H:i:s'),
                'shift' => [
                    'id' => $application->shift->id,
                    'title' => $application->shift->title,
                    'description' => $application->shift->description,
                    'role' => $application->shift->role,
                    'role_display' => $application->shift->role_display,
                    'shift_date' => $application->shift->shift_date->format('Y-m-d'),
                    'start_time' => $application->shift->start_time,
                    'end_time' => $application->shift->end_time,
                    'duration_hours' => (float) $application->shift->duration_hours,
                    'hourly_rate' => (float) $application->shift->hourly_rate,
                    'total_pay' => (float) $application->shift->total_pay,
                    'required_skills' => $application->shift->required_skills,
                    'required_qualifications' => $application->shift->required_qualifications,
                    'special_requirements' => $application->shift->special_requirements,
                    'status' => $application->shift->status,
                    'status_display' => $application->shift->status_display,
                    'max_applicants' => $application->shift->max_applicants,
                    'is_urgent' => $application->shift->is_urgent,
                    'is_recurring' => $application->shift->is_recurring,
                    'recurrence_pattern' => $application->shift->recurrence_pattern,
                    'application_deadline' => $application->shift->application_deadline?->format('Y-m-d H:i:s'),
                    'published_at' => $application->shift->published_at?->format('Y-m-d H:i:s'),
                    'created_at' => $application->shift->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $application->shift->updated_at->format('Y-m-d H:i:s'),
                    'care_home' => [
                        'id' => $application->shift->careHome->id,
                        'name' => $application->shift->careHome->name,
                    ],
                    'selected_worker' => $application->shift->selectedWorker ? [
                        'id' => $application->shift->selectedWorker->id,
                        'name' => $application->shift->selectedWorker->first_name . ' ' . $application->shift->selectedWorker->last_name,
                        'email' => $application->shift->selectedWorker->email,
                    ] : null,
                    'is_available' => $application->shift->isAvailable(),
                    'can_accept_applications' => $application->shift->canAcceptApplications(),
                    'is_urgent_by_time' => $application->shift->isUrgent(),
                    'start_date_time' => $application->shift->start_date_time,
                    'end_date_time' => $application->shift->end_date_time,
                ],
            ]
        ]);
    }
}
