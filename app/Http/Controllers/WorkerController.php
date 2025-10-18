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

class WorkerController extends Controller
{
    /**
     * Worker dashboard - shows available shifts and worker's applications
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        
        // Get available shifts (published and not filled)
        $availableShifts = Shift::where('status', Shift::STATUS_PUBLISHED)
            ->with(['careHome'])
            ->whereDoesntHave('applications', function ($query) use ($user) {
                $query->where('worker_id', $user->id);
            })
            ->orderBy('shift_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        // Get worker's applications
        $myApplications = Application::where('worker_id', $user->id)
            ->with(['shift.careHome'])
            ->orderBy('applied_at', 'desc')
            ->limit(5)
            ->get();

        // Stats
        $stats = [
            'available_shifts' => Shift::where('status', Shift::STATUS_PUBLISHED)->count(),
            'my_applications' => Application::where('worker_id', $user->id)->count(),
            'accepted_applications' => Application::where('worker_id', $user->id)
                ->where('status', Application::STATUS_ACCEPTED)->count(),
            'pending_applications' => Application::where('worker_id', $user->id)
                ->where('status', Application::STATUS_PENDING)->count(),
        ];

        return Inertia::render('Worker/Dashboard', [
            'availableShifts' => $availableShifts,
            'myApplications' => $myApplications,
            'stats' => $stats,
        ]);
    }

    /**
     * Browse all available shifts
     */
    public function shifts(Request $request): Response
    {
        $user = Auth::user();

        // Build query for available shifts
        $query = Shift::where('status', Shift::STATUS_PUBLISHED)
            ->with(['careHome'])
            ->withCount('applications');

        // Apply filters
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->filled('date_from')) {
            $query->where('shift_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('shift_date', '<=', $request->date_to);
        }

        if ($request->filled('min_rate')) {
            $query->where('hourly_rate', '>=', $request->min_rate);
        }

        // Order by date and time
        $shifts = $query->orderBy('shift_date')
            ->orderBy('start_time')
            ->paginate(15);

        // Add application status for each shift
        $shifts->each(function ($shift) use ($user) {
            $application = $shift->applications()->where('worker_id', $user->id)->first();
            $shift->user_application_status = $application ? $application->status : null;
            $shift->user_has_applied = (bool) $application;
        });

        return Inertia::render('Worker/ShiftsMinimal', [
            'shifts' => $shifts,
            'filters' => $request->only(['role', 'location', 'date_from', 'date_to', 'min_rate']),
            'roleOptions' => Shift::getRoleLabels(),
        ]);
    }

    /**
     * Apply for a shift
     */
    public function apply(Request $request, Shift $shift): RedirectResponse
    {
        $user = Auth::user();

        // Validate that user is a healthcare worker
        if (!$user->isHealthCareWorker()) {
            abort(403, 'Only healthcare workers can apply for shifts');
        }

        // Check if shift is available for applications
        if ($shift->status !== Shift::STATUS_PUBLISHED) {
            return redirect()->back()->withErrors(['error' => 'This shift is no longer available for applications']);
        }

        // Check if user already applied
        $existingApplication = Application::where('shift_id', $shift->id)
            ->where('worker_id', $user->id)
            ->first();

        if ($existingApplication) {
            return redirect()->back()->withErrors(['error' => 'You have already applied for this shift']);
        }

        // Validate optional message
        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        // Create application
        Application::create([
            'shift_id' => $shift->id,
            'worker_id' => $user->id,
            'status' => Application::STATUS_PENDING,
            'message' => $validated['message'] ?? null,
            'applied_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Application submitted successfully');
    }

    /**
     * View worker's applications
     */
    public function applications(): Response
    {
        $user = Auth::user();

        $applications = Application::where('worker_id', $user->id)
            ->with(['shift.careHome'])
            ->orderBy('applied_at', 'desc')
            ->paginate(15);

        // Group by status
        $applicationsByStatus = [
            'pending' => $applications->where('status', Application::STATUS_PENDING),
            'accepted' => $applications->where('status', Application::STATUS_ACCEPTED),
            'rejected' => $applications->where('status', Application::STATUS_REJECTED),
            'withdrawn' => $applications->where('status', Application::STATUS_WITHDRAWN),
        ];

        return Inertia::render('Worker/Applications', [
            'applications' => $applications,
            'applicationsByStatus' => $applicationsByStatus,
        ]);
    }

    /**
     * Withdraw an application
     */
    public function withdrawApplication(Application $application): RedirectResponse
    {
        $user = Auth::user();

        // Check ownership
        if ($application->worker_id !== $user->id) {
            abort(403, 'Access denied');
        }

        // Check if application can be withdrawn
        if ($application->status !== Application::STATUS_PENDING) {
            return redirect()->back()->withErrors(['error' => 'Only pending applications can be withdrawn']);
        }

        // Update application
        $application->update([
            'status' => Application::STATUS_WITHDRAWN,
        ]);

        return redirect()->back()->with('success', 'Application withdrawn successfully');
    }
}
