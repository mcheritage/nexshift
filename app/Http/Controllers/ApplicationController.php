<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ApplicationAccepted;
use App\Mail\ApplicationRejected;
use App\Models\Application;
use App\Models\Notification;
use App\Models\Shift;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /**
     * Display all shifts with pending applications
     */
    public function pendingApplications(): Response
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'Access denied: No care home associated');
        }

        // Get all shifts with pending applications
        $shifts = Shift::where('care_home_id', $careHome->id)
            ->whereHas('applications', function($query) {
                $query->where('status', Application::STATUS_PENDING);
            })
            ->with(['applications' => function($query) {
                $query->where('status', Application::STATUS_PENDING)
                    ->with(['worker' => function($q) {
                        $q->select([
                            'id', 'first_name', 'last_name', 'email', 
                            'phone_number', 'profile_photo'
                        ]);
                    }])
                    ->orderBy('applied_at', 'desc');
            }])
            ->withCount(['applications as pending_applications_count' => function($query) {
                $query->where('status', Application::STATUS_PENDING);
            }])
            ->orderBy('start_datetime', 'asc')
            ->get();

        $stats = [
            'total_shifts' => $shifts->count(),
            'total_applications' => $shifts->sum('pending_applications_count'),
        ];

        return Inertia::render('Applications/Pending', [
            'shifts' => $shifts,
            'stats' => $stats,
        ]);
    }

    /**
     * Display applications for a specific shift (for care home managers)
     */
    public function index(Shift $shift): Response
    {
        $user = Auth::user();
        
        // Ensure user can view this shift's applications
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        $applications = $shift->applications()
            ->with(['worker' => function($query) {
                $query->select([
                    'id', 'first_name', 'last_name', 'email', 'phone_number', 
                    'bio', 'qualifications', 'certifications', 'years_experience', 
                    'skills', 'profile_photo', 'hourly_rate_min', 'hourly_rate_max',
                    'available_weekends', 'available_nights', 'additional_notes'
                ]);
            }])
            ->orderBy('applied_at', 'desc')
            ->get();

        return Inertia::render('Applications/Index', [
            'shift' => $shift,
            'applications' => $applications,
        ]);
    }

    /**
     * Accept an application
     */
    public function accept(Application $application): RedirectResponse
    {
        $user = Auth::user();
        
        // Ensure user can manage this application
        if ($application->shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        // Check if shift is already filled
        if ($application->shift->status === Shift::STATUS_FILLED) {
            return redirect()->back()->withErrors(['error' => 'This shift has already been filled']);
        }

        // Check if application is still pending
        if (!$application->isPending()) {
            return redirect()->back()->withErrors(['error' => 'Application is no longer pending']);
        }

        // Update application
        $application->update([
            'status' => Application::STATUS_ACCEPTED,
            'reviewed_at' => now(),
            'reviewed_by' => $user->id,
        ]);

        // Update shift to filled status and assign worker
        $application->shift->update([
            'status' => Shift::STATUS_FILLED,
            'selected_worker_id' => $application->worker_id,
        ]);

        // Log activity
        ActivityLogService::logApplicationStatusChange(
            $application,
            'pending',
            'accepted',
            $application->shift->care_home_id
        );

        // Notify accepted worker (in-app and email)
        Notification::create([
            'user_id' => $application->worker_id,
            'type' => 'application_accepted',
            'title' => 'Application Accepted! 🎉',
            'message' => "Your application for {$application->shift->title} on " . date('M d, Y', strtotime($application->shift->shift_date)) . " has been accepted by {$application->shift->careHome->name}.",
            'data' => [
                'shift_id' => $application->shift_id,
                'application_id' => $application->id,
                'care_home_name' => $application->shift->careHome->name,
            ],
        ]);

        Mail::to($application->worker->email)->send(new ApplicationAccepted($application));

        // Reject all other pending applications for this shift
        $rejectedApplications = $application->shift->applications()
            ->where('id', '!=', $application->id)
            ->where('status', Application::STATUS_PENDING)
            ->get();

        foreach ($rejectedApplications as $rejectedApp) {
            $rejectedApp->update([
                'status' => Application::STATUS_REJECTED,
                'reviewed_at' => now(),
                'reviewed_by' => $user->id,
                'review_notes' => 'Position filled by another applicant',
            ]);

            // Notify rejected workers (in-app and email)
            Notification::create([
                'user_id' => $rejectedApp->worker_id,
                'type' => 'application_rejected',
                'title' => 'Application Update',
                'message' => "The position for {$rejectedApp->shift->title} on " . date('M d, Y', strtotime($rejectedApp->shift->shift_date)) . " has been filled by another applicant.",
                'data' => [
                    'shift_id' => $rejectedApp->shift_id,
                    'application_id' => $rejectedApp->id,
                    'care_home_name' => $rejectedApp->shift->careHome->name,
                ],
            ]);

            Mail::to($rejectedApp->worker->email)->send(new ApplicationRejected($rejectedApp, 'Position filled by another applicant'));
        }

        return redirect()->back()->with('success', 'Application accepted successfully');
    }

    /**
     * Reject an application
     */
    public function reject(Application $application, Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Ensure user can manage this application
        if ($application->shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        // Validate rejection reason
        $validated = $request->validate([
            'review_notes' => 'required|string|max:500',
        ]);

        // Check if application is still pending
        if (!$application->isPending()) {
            return redirect()->back()->withErrors(['error' => 'Application is no longer pending']);
        }

        // Update application
        $application->update([
            'status' => Application::STATUS_REJECTED,
            'reviewed_at' => now(),
            'reviewed_by' => $user->id,
            'review_notes' => $validated['review_notes'],
        ]);

        // Log activity
        ActivityLogService::logApplicationStatusChange(
            $application,
            'pending',
            'rejected',
            $application->shift->care_home_id
        );

        // Notify rejected worker (in-app and email)
        Notification::create([
            'user_id' => $application->worker_id,
            'type' => 'application_rejected',
            'title' => 'Application Update',
            'message' => "Your application for {$application->shift->title} on " . date('M d, Y', strtotime($application->shift->shift_date)) . " was not accepted.",
            'data' => [
                'shift_id' => $application->shift_id,
                'application_id' => $application->id,
                'care_home_name' => $application->shift->careHome->name,
                'review_notes' => $validated['review_notes'],
            ],
        ]);

        Mail::to($application->worker->email)->send(new ApplicationRejected($application, $validated['review_notes']));

        return redirect()->back()->with('success', 'Application rejected');
    }
}
