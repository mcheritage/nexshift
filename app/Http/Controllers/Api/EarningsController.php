<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\TimesheetResource;
use App\Models\Timesheet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EarningsController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);

        $query = Timesheet::with(['shift.careHome', 'careHome'])
            ->where('worker_id', $user->id)
            ->where('status', Timesheet::STATUS_APPROVED)
            ->orderBy('approved_at', 'desc');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('approved_at', [
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

    private function buildSummary(string $workerId, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = Timesheet::where('worker_id', $workerId);

        if ($startDate && $endDate) {
            $query->whereBetween('approved_at', [$startDate, $endDate]);
        }

        $approvedQuery = (clone $query)->where('status', Timesheet::STATUS_APPROVED);
        $submittedQuery = (clone $query)->where('status', Timesheet::STATUS_SUBMITTED);

        $now = Carbon::now();
        $startOfThisMonth = $now->copy()->startOfMonth();
        $endOfThisMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        return [
            'total_approved_pay' => (clone $approvedQuery)->sum('total_pay'),
            'pending_pay' => (clone $submittedQuery)->sum('total_pay'),
            'approved_count' => (clone $approvedQuery)->count(),
            'this_month' => [
                'from' => $startOfThisMonth->toDateString(),
                'to' => $endOfThisMonth->toDateString(),
                'total' => (clone $approvedQuery)
                    ->whereBetween('approved_at', [$startOfThisMonth, $endOfThisMonth])
                    ->sum('total_pay'),
            ],
            'last_month' => [
                'from' => $startOfLastMonth->toDateString(),
                'to' => $endOfLastMonth->toDateString(),
                'total' => (clone $approvedQuery)
                    ->whereBetween('approved_at', [$startOfLastMonth, $endOfLastMonth])
                    ->sum('total_pay'),
            ],
        ];
    }
}



