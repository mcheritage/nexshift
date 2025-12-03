<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ShiftResource;
use App\Http\Resources\TimesheetResource;
use App\Models\Application;
use App\Models\Shift;
use App\Models\Timesheet;
use App\UserRoles;
use App\Utils\Constants;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimesheetController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        $query = Timesheet::with(['shift.careHome', 'careHome'])
            ->where('worker_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('clock_in_time', [
                Carbon::parse($request->query('start_date'))->startOfDay(),
                Carbon::parse($request->query('end_date'))->endOfDay(),
            ]);
        }

        $perPage = (int) $request->query('per_page', 20);
        $timesheets = $query->paginate($perPage);

        return response()->json([
            'data' => TimesheetResource::collection($timesheets->items()),
            'pagination' => [
                'current_page' => $timesheets->currentPage(),
                'last_page' => $timesheets->lastPage(),
                'per_page' => $timesheets->perPage(),
                'total' => $timesheets->total(),
                'has_more' => $timesheets->hasMorePages(),
            ],
            'summary' => $this->buildSummary($user->id),
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        return response()->json(
            $this->buildSummary(
                $user->id,
                $startDate ? Carbon::parse($startDate)->startOfDay() : null,
                $endDate ? Carbon::parse($endDate)->endOfDay() : null
            )
        );
    }

    public function show(Request $request, Timesheet $timesheet): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        if ($timesheet->worker_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $timesheet->load(['shift.careHome', 'careHome']);

        return response()->json([
            'data' => TimesheetResource::make($timesheet),
        ]);
    }

    public function start(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        if (!$user->isHealthCareWorker()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'shift_id' => 'required|uuid|exists:shifts,id',
            'clock_in_time' => 'nullable|date',
            'break_duration_minutes' => 'nullable|integer|min:0|max:480',
            'worker_notes' => 'nullable|string|max:1000',
            'submit_for_approval' => 'sometimes|boolean',
            'has_overtime' => 'sometimes|boolean',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
        ]);

        $shift = Shift::with('careHome')->findOrFail($validated['shift_id']);

        $hasAcceptedApplication = Application::where('shift_id', $shift->id)
            ->where('worker_id', $user->id)
            ->where('status', Application::STATUS_ACCEPTED)
            ->exists();

        if (!$hasAcceptedApplication) {
            return response()->json(['error' => 'You are not assigned to this shift'], 403);
        }

        $existingTimesheet = Timesheet::where('shift_id', $shift->id)
            ->where('worker_id', $user->id)
            ->first();

        if ($existingTimesheet) {
            return response()->json(['error' => 'A timesheet already exists for this shift'], 422);
        }

        $clockInTime = isset($validated['clock_in_time'])
            ? Carbon::parse($validated['clock_in_time'])
            : now();

        $submit = (bool) ($validated['submit_for_approval'] ?? false);
        $breakMinutes = $validated['break_duration_minutes'] ?? 0;

        $timesheet = Timesheet::create([
            'shift_id' => $shift->id,
            'worker_id' => $user->id,
            'care_home_id' => $shift->care_home_id,
            'clock_in_time' => $clockInTime,
            'break_duration_minutes' => $breakMinutes,
            'hourly_rate' => $shift->hourly_rate,
            'status' => $submit ? Timesheet::STATUS_SUBMITTED : Timesheet::STATUS_DRAFT,
            'submitted_at' => $submit ? now() : null,
            'worker_notes' => $validated['worker_notes'] ?? null,
            'has_overtime' => $validated['has_overtime'] ?? false,
            'overtime_hours' => $validated['overtime_hours'] ?? null,
            'overtime_rate' => $validated['overtime_rate'] ?? null,
        ]);

        $timesheet->load(['shift.careHome', 'careHome']);

        return response()->json([
            'data' => TimesheetResource::make($timesheet),
        ], 201);
    }

    public function clockOut(Request $request, Timesheet $timesheet): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        if ($timesheet->worker_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!in_array($timesheet->status, [Timesheet::STATUS_DRAFT, Timesheet::STATUS_QUERIED, Timesheet::STATUS_SUBMITTED])) {
            return response()->json(['error' => 'This timesheet cannot be updated'], 422);
        }

        $validated = $request->validate([
            'clock_out_time' => 'nullable|date',
            'break_duration_minutes' => 'nullable|integer|min:0|max:480',
            'has_overtime' => 'sometimes|boolean',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'worker_notes' => 'nullable|string|max:1000',
            'submit_for_approval' => 'sometimes|boolean',
        ]);

        $clockOutTime = isset($validated['clock_out_time'])
            ? Carbon::parse($validated['clock_out_time'])
            : now();

        if ($timesheet->clock_in_time && $clockOutTime->lessThanOrEqualTo(Carbon::parse($timesheet->getRawOriginal('clock_in_time')))) {
            return response()->json(['error' => 'Clock out time must be after clock in time'], 422);
        }

        $timesheet->clock_out_time = $clockOutTime;
        $timesheet->break_duration_minutes = $validated['break_duration_minutes'] ?? $timesheet->break_duration_minutes ?? 0;
        $timesheet->worker_notes = $validated['worker_notes'] ?? $timesheet->worker_notes;

        if (array_key_exists('has_overtime', $validated)) {
            $timesheet->has_overtime = $validated['has_overtime'];
        }

        if ($timesheet->has_overtime) {
            $timesheet->overtime_hours = $validated['overtime_hours'] ?? $timesheet->overtime_hours ?? 0;
            $timesheet->overtime_rate = $validated['overtime_rate'] ?? $timesheet->overtime_rate ?? ($timesheet->hourly_rate * 1.5);
        } else {
            $timesheet->overtime_hours = null;
            $timesheet->overtime_rate = null;
        }

        $timesheet->total_hours = $timesheet->calculateTotalHours();
        $timesheet->total_pay = $timesheet->calculateTotalPay();

        $submit = (bool) ($validated['submit_for_approval'] ?? false);
        if ($submit) {
            $timesheet->status = Timesheet::STATUS_SUBMITTED;
            $timesheet->submitted_at = now();
        }

        $timesheet->save();
        $timesheet->refresh()->load(['shift.careHome', 'careHome']);

        return response()->json([
            'data' => TimesheetResource::make($timesheet),
        ]);
    }

    public function update(Request $request, Timesheet $timesheet): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        if ($timesheet->worker_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$timesheet->isEditable()) {
            return response()->json(['error' => 'This timesheet cannot be edited'], 422);
        }

        $validated = $request->validate([
            'clock_in_time' => 'nullable|date',
            'clock_out_time' => 'nullable|date',
            'break_duration_minutes' => 'nullable|integer|min:0|max:480',
            'worker_notes' => 'nullable|string|max:1000',
            'has_overtime' => 'sometimes|boolean',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'submit_for_approval' => 'sometimes|boolean',
        ]);

        if (isset($validated['clock_in_time'])) {
            $timesheet->clock_in_time = Carbon::parse($validated['clock_in_time']);
        }

        if (isset($validated['clock_out_time'])) {
            $clockOut = Carbon::parse($validated['clock_out_time']);
            if ($timesheet->clock_in_time && $clockOut->lessThanOrEqualTo(Carbon::parse($timesheet->getRawOriginal('clock_in_time')))) {
                return response()->json(['error' => 'Clock out time must be after clock in time'], 422);
            }
            $timesheet->clock_out_time = $clockOut;
        }

        if (array_key_exists('has_overtime', $validated)) {
            $timesheet->has_overtime = $validated['has_overtime'];
        }

        if ($timesheet->has_overtime) {
            $timesheet->overtime_hours = $validated['overtime_hours'] ?? $timesheet->overtime_hours ?? 0;
            $timesheet->overtime_rate = $validated['overtime_rate'] ?? $timesheet->overtime_rate ?? ($timesheet->hourly_rate * 1.5);
        } else {
            $timesheet->overtime_hours = null;
            $timesheet->overtime_rate = null;
        }

        $timesheet->break_duration_minutes = $validated['break_duration_minutes'] ?? $timesheet->break_duration_minutes ?? 0;
        $timesheet->worker_notes = $validated['worker_notes'] ?? $timesheet->worker_notes;

        $submit = (bool) ($validated['submit_for_approval'] ?? false);
        if ($submit) {
            $timesheet->status = Timesheet::STATUS_SUBMITTED;
            $timesheet->submitted_at = now();
        }

        if ($timesheet->clock_in_time && $timesheet->clock_out_time) {
            $timesheet->total_hours = $timesheet->calculateTotalHours();
            $timesheet->total_pay = $timesheet->calculateTotalPay();
        }

        $timesheet->save();
        $timesheet->refresh()->load(['shift.careHome', 'careHome']);

        return response()->json([
            'data' => TimesheetResource::make($timesheet),
        ]);
    }

    public function submit(Request $request, Timesheet $timesheet): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        if ($timesheet->worker_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!in_array($timesheet->status, [Timesheet::STATUS_DRAFT, Timesheet::STATUS_QUERIED])) {
            return response()->json(['error' => 'This timesheet cannot be submitted'], 422);
        }

        if (!$timesheet->clock_in_time || !$timesheet->clock_out_time) {
            return response()->json(['error' => 'A timesheet must have both clock in and clock out times before submission'], 422);
        }

        $timesheet->status = Timesheet::STATUS_SUBMITTED;
        $timesheet->submitted_at = now();
        $timesheet->save();

        $timesheet->load(['shift.careHome', 'careHome']);

        return response()->json([
            'data' => TimesheetResource::make($timesheet),
        ]);
    }

    public function eligibleShifts(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        if (!$user->isHealthCareWorker()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $dateFilter = $request->query('date');

        $query = Shift::whereHas('applications', function ($query) use ($user) {
            $query->where('worker_id', $user->id)
                ->where('status', Application::STATUS_ACCEPTED);
        })
            ->whereDoesntHave('timesheets', function ($query) use ($user) {
                $query->where('worker_id', $user->id);
            })
            ->with('careHome');

        if ($dateFilter) {
            $query->whereDate('start_datetime', '<=', Carbon::parse($dateFilter));
        } else {
            $query->whereDate('start_datetime', '<=', now()->toDateString());
        }

        $shifts = $query->orderBy('start_datetime', 'desc')->get();

        return response()->json([
            'data' => ShiftResource::collection($shifts),
        ]);
    }

    private function buildSummary(string $workerId, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = Timesheet::where('worker_id', $workerId);

        if ($startDate && $endDate) {
            $query->whereBetween('clock_in_time', [$startDate, $endDate]);
        }

        $baseQuery = clone $query;

        return [
            'total' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', Timesheet::STATUS_SUBMITTED)->count(),
            'approved' => (clone $baseQuery)->where('status', Timesheet::STATUS_APPROVED)->count(),
            'queried' => (clone $baseQuery)->where('status', Timesheet::STATUS_QUERIED)->count(),
            'rejected' => (clone $baseQuery)->where('status', Timesheet::STATUS_REJECTED)->count(),
            'total_pending_pay' => (clone $baseQuery)->where('status', Timesheet::STATUS_SUBMITTED)->sum('total_pay'),
            'total_approved_pay' => (clone $baseQuery)->where('status', Timesheet::STATUS_APPROVED)->sum('total_pay'),
        ];
    }
}

