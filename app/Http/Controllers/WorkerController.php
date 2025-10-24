<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\NewShiftApplication;
use App\Models\Application;
use App\Models\Notification;
use App\Models\Shift;
use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

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
            ->orderBy('start_datetime')
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
            ->orderBy('start_datetime')
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

        \Log::info('Worker apply method called', [
            'user_id' => $user->id,
            'shift_id' => $shift->id,
            'user_role' => $user->role,
        ]);

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
        $application = Application::create([
            'shift_id' => $shift->id,
            'worker_id' => $user->id,
            'status' => Application::STATUS_PENDING,
            'message' => $validated['message'] ?? null,
            'applied_at' => now(),
        ]);

        \Log::info('Application created', ['application_id' => $application->id]);

        // Notify ALL care home admins about new application
        $careHomeAdmins = User::where('care_home_id', $shift->care_home_id)
            ->where('role', 'care_home_admin')
            ->get();
        
        \Log::info('Care home admins loaded', [
            'care_home_id' => $shift->care_home_id,
            'admin_count' => $careHomeAdmins->count(),
            'admin_emails' => $careHomeAdmins->pluck('email')->toArray(),
        ]);

        foreach ($careHomeAdmins as $admin) {
            // In-app notification
            $notification = Notification::create([
                'user_id' => $admin->id,
                'type' => 'shift_application',
                'title' => 'New Shift Application',
                'message' => "{$user->first_name} {$user->last_name} has applied for the {$shift->title} shift on " . date('M d, Y', strtotime($shift->shift_date)),
                'data' => [
                    'shift_id' => $shift->id,
                    'application_id' => $application->id,
                    'worker_id' => $user->id,
                    'worker_name' => "{$user->first_name} {$user->last_name}",
                ],
            ]);
            \Log::info('Notification created', [
                'notification_id' => $notification->id,
                'for_admin' => $admin->email,
            ]);

            // Send email notification
            try {
                Mail::to($admin->email)->send(new NewShiftApplication($application));
                \Log::info('Email sent successfully to ' . $admin->email);
            } catch (\Exception $e) {
                \Log::error('Email sending failed to ' . $admin->email . ': ' . $e->getMessage());
            }
        }

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
     * View worker's accepted shifts
     */
    public function myShifts(): Response
    {
        $user = Auth::user();

        // Get shifts where worker has accepted applications
        $shifts = Shift::whereHas('applications', function ($query) use ($user) {
                $query->where('worker_id', $user->id)
                      ->where('status', Application::STATUS_ACCEPTED);
            })
            ->with(['careHome', 'timesheets' => function ($query) use ($user) {
                $query->where('worker_id', $user->id);
            }])
            ->orderBy('shift_date', 'desc')
            ->orderBy('start_datetime')
            ->paginate(15);

        // Add timesheet status for each shift
        $shifts->each(function ($shift) use ($user) {
            $timesheet = $shift->timesheets->first();
            $shift->timesheet_status = $timesheet ? $timesheet->status : null;
            $shift->timesheet_id = $timesheet ? $timesheet->id : null;
            $shift->can_create_timesheet = !$timesheet && $shift->shift_date < now()->format('Y-m-d');
        });

        return Inertia::render('Worker/MyShifts', [
            'shifts' => $shifts,
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

    /**
     * Display worker's timesheets
     */
    public function timesheets(): Response
    {
        $user = Auth::user();
        
        // Get worker's timesheets
        $timesheets = Timesheet::where('worker_id', $user->id)
            ->with(['shift.careHome'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Get shifts that need timesheets (accepted applications where shift date has passed)
        $shiftsNeedingTimesheets = Shift::whereHas('applications', function ($query) use ($user) {
                $query->where('worker_id', $user->id)
                      ->where('status', Application::STATUS_ACCEPTED);
            })
            ->where('shift_date', '<', now()->format('Y-m-d')) // Shift date has passed
            ->whereDoesntHave('timesheets', function ($query) use ($user) {
                $query->where('worker_id', $user->id);
            })
            ->with(['careHome'])
            ->orderBy('shift_date', 'desc')
            ->get();

        return Inertia::render('Worker/Timesheets', [
            'timesheets' => $timesheets,
            'shiftsNeedingTimesheets' => $shiftsNeedingTimesheets,
        ]);
    }

    /**
     * Show form to create timesheet for a shift
     */
    public function createTimesheet(Shift $shift): Response
    {
        $user = Auth::user();

        // Verify worker was assigned to this shift
        $application = Application::where('shift_id', $shift->id)
            ->where('worker_id', $user->id)
            ->where('status', Application::STATUS_ACCEPTED)
            ->first();

        if (!$application) {
            abort(403, 'You are not authorized to create a timesheet for this shift');
        }

        // Check if timesheet already exists
        $existingTimesheet = Timesheet::where('shift_id', $shift->id)
            ->where('worker_id', $user->id)
            ->first();

        if ($existingTimesheet) {
            return redirect()->route('worker.timesheets.edit', $existingTimesheet);
        }

        return Inertia::render('Worker/CreateTimesheet', [
            'shift' => $shift->load('careHome'),
        ]);
    }

    /**
     * Store new timesheet
     */
    public function storeTimesheet(Request $request, Shift $shift): RedirectResponse
    {
        $user = Auth::user();

        // Verify worker was assigned to this shift
        $application = Application::where('shift_id', $shift->id)
            ->where('worker_id', $user->id)
            ->where('status', Application::STATUS_ACCEPTED)
            ->first();

        if (!$application) {
            abort(403, 'You are not authorized to create a timesheet for this shift');
        }

        $request->validate([
            'clock_in_time' => 'required|string',
            'clock_out_time' => 'required|string',
            'break_duration_minutes' => 'required|integer|min:0|max:480',
            'worker_notes' => 'nullable|string|max:1000',
            'submit_for_approval' => 'boolean',
            'calculated_hours' => 'required|numeric|min:0',
            'calculated_pay' => 'required|numeric|min:0',
            'has_overtime' => 'required|boolean',
            'overtime_hours' => 'required|numeric|min:0',
        ]);

        // Use the frontend calculated values instead of recalculating
        $totalHours = round($request->calculated_hours, 2);
        $totalPay = round($request->calculated_pay, 2);
        $hasOvertime = $request->has_overtime;
        $overtimeHours = round($request->overtime_hours, 2);
        $overtimeRate = $hasOvertime ? ($shift->hourly_rate * 1.5) : null;

        $status = $request->boolean('submit_for_approval') ? 'submitted' : 'draft';
        $submittedAt = $request->boolean('submit_for_approval') ? Carbon::now() : null;

        // Create proper datetime objects using shift date + times
        $clockInTime = trim($request->clock_in_time);
        $clockOutTime = trim($request->clock_out_time);
        
        // Ensure times are in HH:MM format (pad with zero if needed)
        if (strlen($clockInTime) === 4 && strpos($clockInTime, ':') === 1) {
            $clockInTime = '0' . $clockInTime;
        }
        if (strlen($clockOutTime) === 4 && strpos($clockOutTime, ':') === 1) {
            $clockOutTime = '0' . $clockOutTime;
        }
        
        // Extract just the date part from shift_date
        $shiftDate = Carbon::parse($shift->shift_date)->format('Y-m-d');
        
        $clockInDateTime = Carbon::createFromFormat('Y-m-d H:i', $shiftDate . ' ' . $clockInTime, 'UTC');
        $clockOutDateTime = Carbon::createFromFormat('Y-m-d H:i', $shiftDate . ' ' . $clockOutTime, 'UTC');
        
        // Handle overnight shifts
        if ($clockOutDateTime <= $clockInDateTime) {
            $clockOutDateTime->addDay();
        }

        Timesheet::create([
            'shift_id' => $shift->id,
            'worker_id' => $user->id,
            'care_home_id' => $shift->care_home_id,
            'clock_in_time' => $clockInDateTime,
            'clock_out_time' => $clockOutDateTime,
            'break_duration_minutes' => $request->break_duration_minutes,
            'total_hours' => $totalHours,
            'hourly_rate' => $shift->hourly_rate,
            'total_pay' => $totalPay,
            'has_overtime' => $hasOvertime,
            'overtime_hours' => $overtimeHours,
            'overtime_rate' => $hasOvertime ? $overtimeRate : null,
            'worker_notes' => $request->worker_notes,
            'status' => $status,
            'submitted_at' => $submittedAt,
        ]);

        return redirect()->route('worker.timesheets')->with('success', 'Timesheet created successfully');
    }

    /**
     * Show form to edit timesheet
     */
    public function editTimesheet(Timesheet $timesheet): Response
    {
        $user = Auth::user();

        if ($timesheet->worker_id !== $user->id) {
            abort(403, 'You are not authorized to edit this timesheet');
        }

        if (!in_array($timesheet->status, ['draft', 'queried'])) {
            abort(403, 'This timesheet cannot be edited');
        }

        return Inertia::render('Worker/EditTimesheet', [
            'timesheet' => $timesheet->load('shift.careHome'),
        ]);
    }

    /**
     * Update timesheet
     */
    public function updateTimesheet(Request $request, Timesheet $timesheet): RedirectResponse
    {
        $user = Auth::user();

        if ($timesheet->worker_id !== $user->id) {
            abort(403, 'You are not authorized to edit this timesheet');
        }

        if (!in_array($timesheet->status, ['draft', 'queried'])) {
            abort(403, 'This timesheet cannot be edited');
        }

        $request->validate([
            'clock_in_time' => 'required|string',
            'clock_out_time' => 'required|string',
            'break_duration_minutes' => 'required|integer|min:0|max:480',
            'worker_notes' => 'nullable|string|max:1000',
            'submit_for_approval' => 'boolean',
            'calculated_hours' => 'required|numeric|min:0',
            'calculated_pay' => 'required|numeric|min:0',
            'has_overtime' => 'required|boolean',
            'overtime_hours' => 'required|numeric|min:0',
        ]);

        // Use the frontend calculated values instead of recalculating
        $totalHours = round($request->calculated_hours, 2);
        $totalPay = round($request->calculated_pay, 2);
        $hasOvertime = $request->has_overtime;
        $overtimeHours = round($request->overtime_hours, 2);
        $overtimeRate = $hasOvertime ? ($timesheet->shift->hourly_rate * 1.5) : null;

        // Create proper datetime objects using shift date + times
        $clockInTime = trim($request->clock_in_time);
        $clockOutTime = trim($request->clock_out_time);
        
        // Ensure times are in HH:MM format (pad with zero if needed)
        if (strlen($clockInTime) === 4 && strpos($clockInTime, ':') === 1) {
            $clockInTime = '0' . $clockInTime;
        }
        if (strlen($clockOutTime) === 4 && strpos($clockOutTime, ':') === 1) {
            $clockOutTime = '0' . $clockOutTime;
        }
        
        // Extract just the date part from shift_date
        $shiftDate = Carbon::parse($timesheet->shift->shift_date)->format('Y-m-d');
        
        $clockInDateTime = Carbon::createFromFormat('Y-m-d H:i', $shiftDate . ' ' . $clockInTime, 'UTC');
        $clockOutDateTime = Carbon::createFromFormat('Y-m-d H:i', $shiftDate . ' ' . $clockOutTime, 'UTC');
        
        // Handle overnight shifts
        if ($clockOutDateTime <= $clockInDateTime) {
            $clockOutDateTime->addDay();
        }

        $updateData = [
            'clock_in_time' => $clockInDateTime,
            'clock_out_time' => $clockOutDateTime,
            'break_duration_minutes' => $request->break_duration_minutes,
            'total_hours' => $totalHours,
            'total_pay' => $totalPay,
            'has_overtime' => $hasOvertime,
            'overtime_hours' => $overtimeHours,
            'overtime_rate' => $overtimeRate,
            'worker_notes' => $request->worker_notes,
        ];

        // If submitting for approval, update status and submission time
        if ($request->boolean('submit_for_approval')) {
            $updateData['status'] = 'submitted';
            $updateData['submitted_at'] = Carbon::now();
        }

        $timesheet->update($updateData);

        return redirect()->route('worker.timesheets')->with('success', 'Timesheet updated successfully');
    }

    /**
     * Submit timesheet for approval
     */
    public function submitTimesheet(Timesheet $timesheet): RedirectResponse
    {
        $user = Auth::user();

        if ($timesheet->worker_id !== $user->id) {
            abort(403, 'You are not authorized to submit this timesheet');
        }

        if (!in_array($timesheet->status, ['draft', 'queried'])) {
            abort(403, 'This timesheet cannot be submitted');
        }

        $timesheet->update([
            'status' => 'submitted',
            'submitted_at' => Carbon::now(),
        ]);

        return redirect()->route('worker.timesheets')->with('success', 'Timesheet submitted for approval');
    }
}
