<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            ->with(['selectedWorker', 'createdBy']);
            // TODO: Add ->withCount('applications') when Application model is created

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

        // Order by start datetime
        $shifts = $query->orderBy('start_date_time', 'desc')
            ->paginate(20);

        // Get summary statistics
        $stats = [
            'total_shifts' => Shift::where('care_home_id', $careHome->id)->count(),
            'published_shifts' => Shift::where('care_home_id', $careHome->id)->where('status', Shift::STATUS_PUBLISHED)->count(),
            'filled_shifts' => Shift::where('care_home_id', $careHome->id)->where('status', Shift::STATUS_FILLED)->count(),
            'applications_count' => 0, // Will be calculated when applications table is created
        ];

        return inertia('Shifts/CleanIndex', [
            'shifts' => $shifts,
            'stats' => $stats,
            'filters' => $request->only(['status', 'role', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new shift
     */
    public function create(): Response
    {
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

        // Debug: Log the incoming request data
        \Log::info('Shift creation request data:', $request->all());
        \Log::info('Start time value:', ['start_time' => $request->get('start_time')]);
        \Log::info('End time value:', ['end_time' => $request->get('end_time')]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'role' => ['required', Rule::in(array_keys(Shift::getRoles()))],
            'shift_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'ends_next_day' => 'boolean',
            'hourly_rate' => 'required|numeric|min:10|max:100',
            'location' => 'required|string|max:255',
            'required_skills' => 'nullable|array',
            'preferred_skills' => 'nullable|array',
            'additional_requirements' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'is_urgent' => 'boolean',
            'status' => ['required', Rule::in([Shift::STATUS_DRAFT, Shift::STATUS_PUBLISHED])],
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
        $totalPay = $durationHours * $validated['hourly_rate'];

        // Prepare data for database insertion
        $shiftData = [
            'care_home_id' => $careHome->id,
            'created_by' => $user->id,
            'title' => $validated['title'],
            'role' => $validated['role'],
            'shift_date' => $validated['shift_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'duration_hours' => $durationHours,
            'hourly_rate' => $validated['hourly_rate'],
            'total_pay' => $totalPay,
            'required_skills' => $validated['required_skills'] ?? [],
            'special_requirements' => $validated['additional_requirements'],
            'status' => $validated['status'],
            'is_urgent' => $validated['is_urgent'] ?? false,
            'published_at' => $validated['status'] === Shift::STATUS_PUBLISHED ? now() : null,
        ];

        // Add location if it maps to a database field, otherwise add to special_requirements
        if (!empty($validated['location'])) {
            if (isset($validated['special_requirements'])) {
                $shiftData['special_requirements'] = "Location: " . $validated['location'] . "\n\n" . $validated['additional_requirements'];
            } else {
                $shiftData['special_requirements'] = "Location: " . $validated['location'];
            }
        }

        // Add notes to description field
        if (!empty($validated['notes'])) {
            $shiftData['description'] = $validated['notes'];
        }

        $shift = Shift::create($shiftData);

        return redirect()->route('shifts.index')
            ->with('success', 'Shift created successfully.');
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

        $shift->load(['careHome', 'selectedWorker', 'createdBy']);
        // TODO: Add 'applications.applicant' when Application model is created

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

        return Inertia::render('shifts/edit', [
            'shift' => $shift,
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
            'shift_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'hourly_rate' => 'required|numeric|min:10|max:100',
            'required_skills' => 'nullable|array',
            'required_qualifications' => 'nullable|array',
            'special_requirements' => 'nullable|string|max:500',
            'max_applicants' => 'required|integer|min:1|max:10',
            'is_urgent' => 'boolean',
            'application_deadline' => 'nullable|date|after:now',
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

        $shift->update([
            'duration_hours' => $durationHours,
            'total_pay' => $totalPay,
            'published_at' => $validated['status'] === Shift::STATUS_PUBLISHED && !$shift->published_at ? now() : $shift->published_at,
            ...$validated,
        ]);

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

        $shift->delete();

        return redirect()->route('shifts.index')
            ->with('success', 'Shift deleted successfully.');
    }

    /**
     * Publish a draft shift
     */
    public function publish(Shift $shift): JsonResponse
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        if ($shift->status !== Shift::STATUS_DRAFT) {
            return response()->json(['error' => 'Only draft shifts can be published'], 400);
        }

        $shift->update([
            'status' => Shift::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift published successfully',
            'shift' => $shift->fresh(),
        ]);
    }

    /**
     * Cancel a published shift
     */
    public function cancel(Shift $shift): JsonResponse
    {
        $user = Auth::user();
        
        if ($shift->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        if ($shift->status === Shift::STATUS_COMPLETED) {
            return response()->json(['error' => 'Cannot cancel completed shifts'], 400);
        }

        $shift->update(['status' => Shift::STATUS_CANCELLED]);

        return response()->json([
            'success' => true,
            'message' => 'Shift cancelled successfully',
            'shift' => $shift->fresh(),
        ]);
    }
}
