<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ShiftCancelled;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\Shift;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    /**
     * Display a listing of shifts for the care home
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'Access denied: No care home associated');
        }

        // Get shifts with filters
        $query = Shift::where('care_home_id', $careHome->id)
            ->with(['selectedWorker', 'createdBy', 'applications.user'])
            ->withCount('applications');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('role', 'like', '%' . $search . '%')
                  ->orWhere('location', 'like', '%' . $search . '%')
                  ->orWhere('notes', 'like', '%' . $search . '%');
            });
        }

        // Order by shift date and start time
        $shifts = $query->orderBy('start_datetime', 'desc')
            ->paginate(20);

        // Get summary statistics
        $stats = [
            'total_shifts' => Shift::where('care_home_id', $careHome->id)->count(),
            'published_shifts' => Shift::where('care_home_id', $careHome->id)->where('status', Shift::STATUS_PUBLISHED)->count(),
            'filled_shifts' => Shift::where('care_home_id', $careHome->id)->where('status', Shift::STATUS_FILLED)->count(),
            'applications_count' => \App\Models\Application::whereHas('shift', function($query) use ($careHome) {
                $query->where('care_home_id', $careHome->id);
            })->count(),
        ];

        return inertia('Shifts/TableIndex', [
            'shifts' => $shifts,
            'stats' => $stats,
            'filters' => $request->only(['status', 'role', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new shift
     */
    public function create(): Response|RedirectResponse
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'Access denied: No care home associated');
        }

        // Prevent non-approved care homes from creating shifts
        if ($careHome->status !== 'approved') {
            $message = match($careHome->status) {
                'pending' => 'Your care home is pending verification. Please complete your document verification.',
                'rejected' => 'Your care home has been rejected. Please contact support for assistance.',
                'suspended' => 'Your care home has been suspended. Please contact support for assistance.',
                default => 'Your care home must be approved before you can post shifts.',
            };
            
            return redirect()->route('dashboard')
                ->with('error', $message);
        }

        return Inertia::render('Shifts/Create');
    }

    /**
     * Store a newly created shift
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'Access denied: No care home associated');
        }

        // Check if care home is approved
        if (!$careHome->isApproved()) {
            return redirect()->back()->withErrors([
                'error' => 'Your care home must be approved by an administrator before you can post shifts.'
            ]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'role' => ['required', Rule::in(array_keys(Shift::getRoles()))],
            'shift_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'ends_next_day' => 'boolean',
            'break_duration' => 'nullable|integer|min:0|max:720',
            'break_paid' => 'boolean',
            'hourly_rate' => 'required|numeric|min:10|max:100',
            'location' => 'required|string|max:255',
            'required_skills' => 'nullable|array',
            'preferred_skills' => 'nullable|array',
            'additional_requirements' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'is_urgent' => 'boolean',
            'status' => ['required', Rule::in([Shift::STATUS_DRAFT, Shift::STATUS_PUBLISHED])],
            'quantity' => 'nullable|integer|min:1|max:50',
        ]);

        // Create datetime objects from separate date and time fields
        $startDateTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', 
            $validated['shift_date'] . ' ' . $validated['start_time'] . ':00');
        $endDateTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', 
            $validated['shift_date'] . ' ' . $validated['end_time'] . ':00');
        
        // Handle shifts that end the next day
        if ($validated['ends_next_day']) {
            $endDateTime->addDay();
        }
        
        $durationHours = $endDateTime->diffInHours($startDateTime, true);
        $breakDuration = $validated['break_duration'] ?? 0;
        $breakPaid = $validated['break_paid'] ?? true;
        
        // Calculate billable hours (subtract unpaid break time)
        // Convert break minutes to hours
        $breakHours = $breakDuration / 60;
        $billableHours = $breakPaid ? $durationHours : ($durationHours - $breakHours);
        $totalPay = $billableHours * $validated['hourly_rate'];

        // Prepare data for database insertion
        $shiftData = [
            'care_home_id' => $careHome->id,
            'created_by' => $user->id,
            'title' => $validated['title'],
            'role' => $validated['role'],
            'location' => $validated['location'],
            'start_datetime' => $startDateTime,
            'end_datetime' => $endDateTime,
            'duration_hours' => $durationHours,
            'break_duration' => $breakDuration,
            'break_paid' => $breakPaid,
            'hourly_rate' => $validated['hourly_rate'],
            'total_pay' => $totalPay,
            'required_skills' => $validated['required_skills'] ?? [],
            'special_requirements' => $validated['additional_requirements'],
            'description' => $validated['notes'],
            'status' => $validated['status'],
            'is_urgent' => $validated['is_urgent'] ?? false,
            'published_at' => $validated['status'] === Shift::STATUS_PUBLISHED ? now() : null,
            'max_applicants' => 1, // Each shift can only have 1 worker
        ];

        // Get quantity (default to 1 if not provided)
        $quantity = $validated['quantity'] ?? 1;

        // Create multiple shifts if quantity > 1
        $createdShifts = [];
        for ($i = 0; $i < $quantity; $i++) {
            $shift = Shift::create($shiftData);
            $createdShifts[] = $shift;
            
            // Log activity for each shift
            ActivityLogService::logShiftCreated($shift, $user->care_home_id);
        }

        $message = $quantity > 1 
            ? "$quantity identical shifts created successfully."
            : 'Shift created successfully.';

        return redirect()->route('shifts.index')
            ->with('success', $message);
    }

    /**
     * Display the specified shift
     */
    public function show(Shift $shift): Response
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        $shift->load(['careHome', 'selectedWorker', 'createdBy', 'applications.worker']);
        $shift->loadCount('applications');

        return Inertia::render('Shifts/Show', [
            'shift' => $shift,
        ]);
    }

    /**
     * Show the form for editing the shift
     */
    public function edit(Shift $shift): Response
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        // Format shift data for the form
        // Ensure datetime fields are Carbon instances
        $startDateTime = \Carbon\Carbon::parse($shift->start_datetime);
        $endDateTime = \Carbon\Carbon::parse($shift->end_datetime);
        
        $shiftData = $shift->toArray();
        $shiftData['shift_date'] = $startDateTime->format('Y-m-d');
        $shiftData['start_time'] = $startDateTime->format('H:i');
        $shiftData['end_time'] = $endDateTime->format('H:i');
        $shiftData['ends_next_day'] = $endDateTime->format('Y-m-d') !== $startDateTime->format('Y-m-d');
        $shiftData['additional_requirements'] = $shift->special_requirements;
        $shiftData['notes'] = $shift->description;

        return Inertia::render('Shifts/Edit', [
            'shift' => $shiftData,
            'roles' => Shift::getRoles(),
            'statuses' => Shift::getStatuses(),
        ]);
    }

    /**
     * Update the specified shift
     */
    public function update(Request $request, Shift $shift): RedirectResponse
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        // Prevent editing if shift is filled or completed
        if (in_array($shift->status, [Shift::STATUS_FILLED, Shift::STATUS_COMPLETED])) {
            return redirect()->back()->withErrors(['error' => 'Cannot edit filled or completed shifts']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'role' => ['required', Rule::in(array_keys(Shift::getRoles()))],
            'location' => 'required|string|max:255',
            'shift_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'ends_next_day' => 'boolean',
            'hourly_rate' => 'required|numeric|min:10|max:100',
            'required_skills' => 'nullable|array',
            'preferred_skills' => 'nullable|array',
            'additional_requirements' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'is_urgent' => 'boolean',
            'status' => ['required', Rule::in(array_keys(Shift::getStatuses()))],
        ]);

        // Recalculate duration and total pay
        $startTime = \Carbon\Carbon::parse($validated['start_time']);
        $endTime = \Carbon\Carbon::parse($validated['end_time']);
        
        if ($endTime->lessThan($startTime)) {
            $endTime->addDay();
        }
        
        $durationHours = $endTime->diffInHours($startTime, true);
        $totalPay = $durationHours * $validated['hourly_rate'];

        // Create datetime objects from separate date and time fields
        // Ensure time is in H:i format before adding seconds
        $startTimeStr = strlen($validated['start_time']) === 5 ? $validated['start_time'] : sprintf('%02d:%02d', ...explode(':', $validated['start_time']));
        $endTimeStr = strlen($validated['end_time']) === 5 ? $validated['end_time'] : sprintf('%02d:%02d', ...explode(':', $validated['end_time']));
        
        $startDateTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', 
            $validated['shift_date'] . ' ' . $startTimeStr . ':00');
        $endDateTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', 
            $validated['shift_date'] . ' ' . $endTimeStr . ':00');
        
        // Handle shifts that end the next day
        if ($validated['ends_next_day'] ?? false) {
            $endDateTime->addDay();
        }

        // Prepare update data
        $updateData = [
            'title' => $validated['title'],
            'role' => $validated['role'],
            'location' => $validated['location'],
            'start_datetime' => $startDateTime,
            'end_datetime' => $endDateTime,
            'duration_hours' => $durationHours,
            'hourly_rate' => $validated['hourly_rate'],
            'total_pay' => $totalPay,
            'required_skills' => $validated['required_skills'] ?? [],
            'special_requirements' => $validated['additional_requirements'],
            'description' => $validated['notes'],
            'status' => $validated['status'],
            'is_urgent' => $validated['is_urgent'] ?? false,
            'published_at' => $validated['status'] === Shift::STATUS_PUBLISHED && !$shift->published_at ? now() : $shift->published_at,
        ];

        $shift->update($updateData);

        // Log activity
        ActivityLogService::logShiftUpdated($shift, $updateData, $user->care_home_id);

        return redirect()->route('shifts.show', $shift)
            ->with('success', 'Shift updated successfully.');
    }

    /**
     * Remove the specified shift
     */
    public function destroy(Shift $shift): RedirectResponse
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        // Prevent deletion if shift has applications or is in progress
        if (in_array($shift->status, [Shift::STATUS_FILLED, Shift::STATUS_IN_PROGRESS, Shift::STATUS_COMPLETED])) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete shifts with applications or in progress']);
        }

        $shiftTitle = $shift->title;
        $shiftId = $shift->id;
        $careHomeId = $shift->care_home_id;

        $shift->delete();

        // Log activity
        ActivityLogService::logShiftDeleted($shiftTitle, $shiftId, $careHomeId);

        return redirect()->route('shifts.index')
            ->with('success', 'Shift deleted successfully.');
    }

    /**
     * Publish a draft shift
     */
    public function publish(Shift $shift): RedirectResponse
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        // Check if care home is approved
        $careHome = $user->care_home;
        if (!$careHome || !$careHome->isApproved()) {
            return redirect()->back()->withErrors([
                'error' => 'Your care home must be approved by an administrator before you can publish shifts.'
            ]);
        }

        if ($shift->status !== Shift::STATUS_DRAFT) {
            return redirect()->back()->withErrors(['error' => 'Only draft shifts can be published']);
        }

        $shift->update([
            'status' => Shift::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Shift published successfully');
    }

    /**
     * Cancel a published shift
     */
    public function cancel(Request $request, Shift $shift): RedirectResponse
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        if ($shift->status === Shift::STATUS_COMPLETED) {
            return redirect()->back()->withErrors(['error' => 'Cannot cancel completed shifts']);
        }

        // Validate cancellation reason
        $request->validate([
            'cancellation_reason' => 'required|string|min:10|max:500',
        ]);

        // Update shift status and cancellation details
        $shift->update([
            'status' => Shift::STATUS_CANCELLED,
            'cancellation_reason' => $request->cancellation_reason,
            'cancelled_by' => $user->id,
            'cancelled_at' => now(),
        ]);

        // Load the selected worker if exists
        $shift->load('selectedWorker');

        // Create notification for the selected worker
        if ($shift->selectedWorker) {
            Notification::create([
                'user_id' => $shift->selectedWorker->id,
                'type' => 'shift_cancelled',
                'title' => 'Shift Cancelled',
                'message' => "The shift '{$shift->title}' on {$shift->shift_date} has been cancelled. Reason: {$request->cancellation_reason}",
                'data' => [
                    'shift_id' => $shift->id,
                    'shift_title' => $shift->title,
                    'shift_date' => $shift->shift_date,
                    'cancellation_reason' => $request->cancellation_reason,
                    'cancelled_by' => $user->first_name . ' ' . $user->last_name,
                ],
            ]);

            // Send email notification
            try {
                Mail::to($shift->selectedWorker->email)->send(
                    new ShiftCancelled($shift, $request->cancellation_reason)
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send shift cancellation email', [
                    'error' => $e->getMessage(),
                    'worker_email' => $shift->selectedWorker->email,
                ]);
            }
        }

        // Log the activity
        ActivityLog::create([
            'user_id' => $user->id,
            'care_home_id' => $shift->care_home_id,
            'action' => 'shift_cancelled',
            'subject_type' => Shift::class,
            'subject_id' => $shift->id,
            'description' => "{$user->first_name} {$user->last_name} cancelled shift '{$shift->title}' on {$shift->shift_date}",
            'properties' => [
                'shift_id' => $shift->id,
                'shift_title' => $shift->title,
                'shift_date' => $shift->shift_date,
                'cancellation_reason' => $request->cancellation_reason,
                'worker_id' => $shift->selected_worker_id,
                'worker_name' => $shift->selectedWorker ? $shift->selectedWorker->first_name . ' ' . $shift->selectedWorker->last_name : null,
            ],
        ]);

        return redirect()->back()
            ->with('success', 'Shift cancelled successfully. Worker has been notified.');
    }
}
