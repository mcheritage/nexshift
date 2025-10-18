<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
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

        // Reject all other pending applications for this shift
        $application->shift->applications()
            ->where('id', '!=', $application->id)
            ->where('status', Application::STATUS_PENDING)
            ->update([
                'status' => Application::STATUS_REJECTED,
                'reviewed_at' => now(),
                'reviewed_by' => $user->id,
                'review_notes' => 'Position filled by another applicant',
            ]);

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

        return redirect()->back()->with('success', 'Application rejected');
    }
}
