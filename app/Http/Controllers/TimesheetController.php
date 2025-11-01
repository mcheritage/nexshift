<?php

namespace App\Http\Controllers;

use App\Models\Timesheet;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TimesheetController extends Controller
{
    /**
     * Display timesheet approval dashboard for care home managers
     */
    public function index(Request $request): Response
    {
        \Log::info('TimesheetController index called');
        
        $user = Auth::user();
        \Log::info('User ID: ' . $user->id);
        
        $careHome = $user->care_home;
        \Log::info('Care home: ' . ($careHome ? $careHome->id : 'null'));

        if (!$careHome) {
            \Log::error('No care home associated with user');
            abort(403, 'Access denied: No care home associated');
        }

        // Get filters from request
        $status = $request->get('status', 'submitted'); // Default to 'submitted'
        $search = $request->get('search');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        \Log::info('Filters applied', compact('status', 'search', 'dateFrom', 'dateTo'));

        try {
            // Build query for timesheets with relationships
            // Exclude drafts - only show submitted, approved, queried, or rejected timesheets
            $query = Timesheet::with(['worker', 'shift'])
                ->where('care_home_id', $careHome->id)
                ->where('status', '!=', 'draft'); // Drafts are only visible to the worker

            \Log::info('Base query built for care home: ' . $careHome->id);

            // Apply status filter
            if ($status) {
                $query->where('status', $status);
                \Log::info('Status filter applied: ' . $status);
            }

            // Order by creation date (newest first)
            $timesheets = $query->orderBy('created_at', 'desc')
                ->paginate(20);

            \Log::info('Query executed, found ' . $timesheets->total() . ' timesheets');

            // Get simple statistics (excluding drafts)
            $stats = [
                'total' => Timesheet::where('care_home_id', $careHome->id)->where('status', '!=', 'draft')->count(),
                'pending' => Timesheet::where('care_home_id', $careHome->id)->where('status', 'submitted')->count(),
                'approved' => Timesheet::where('care_home_id', $careHome->id)->where('status', 'approved')->count(),
                'queried' => Timesheet::where('care_home_id', $careHome->id)->where('status', 'queried')->count(),
                'rejected' => Timesheet::where('care_home_id', $careHome->id)->where('status', 'rejected')->count(),
                'total_pending_pay' => Timesheet::where('care_home_id', $careHome->id)
                    ->where('status', 'submitted')
                    ->sum('total_pay'),
                'total_approved_pay' => Timesheet::where('care_home_id', $careHome->id)
                    ->where('status', 'approved')
                    ->sum('total_pay'),
            ];

            \Log::info('Stats calculated', $stats);

            return Inertia::render('Timesheets/Index', [
                'timesheets' => $timesheets,
                'stats' => $stats,
                'filters' => [
                    'status' => $status,
                    'search' => $search,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                ],
                'statusOptions' => [
                    'submitted' => 'Submitted',
                    'approved' => 'Approved',
                    'queried' => 'Queried',
                    'rejected' => 'Rejected'
                ]
            ]);
        } catch (\Exception $e) {
            // Log the error and return a simple response
            \Log::error('Timesheet index error: ' . $e->getMessage());
            \Log::error('Timesheet index stack trace: ' . $e->getTraceAsString());
            
            // Create proper empty pagination structure
            $emptyPagination = new \Illuminate\Pagination\LengthAwarePaginator(
                collect([]), // Empty collection
                0, // Total items
                20, // Per page
                1, // Current page
                [
                    'path' => request()->url(),
                    'pageName' => 'page',
                ]
            );
            
            return Inertia::render('Timesheets/Index', [
                'timesheets' => $emptyPagination,
                'stats' => [
                    'total' => 0,
                    'pending' => 0,
                    'approved' => 0,
                    'queried' => 0,
                    'rejected' => 0,
                    'total_pending_pay' => 0,
                    'total_approved_pay' => 0,
                ],
                'filters' => [
                    'status' => $status,
                    'search' => $search,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                ],
                'statusOptions' => [
                    'submitted' => 'Submitted',
                    'approved' => 'Approved',
                    'queried' => 'Queried',
                    'rejected' => 'Rejected'
                ]
            ]);
        }
    }

    /**
     * Approve a timesheet
     */
    public function approve(Timesheet $timesheet): RedirectResponse
    {
        $user = Auth::user();

        // Verify access
        if ($timesheet->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        if (!$timesheet->canBeApproved()) {
            return redirect()->back()->with('error', 'This timesheet cannot be approved.');
        }

        $timesheet->update([
            'status' => Timesheet::STATUS_APPROVED,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Timesheet approved successfully.');
    }

    /**
     * Query a timesheet (request more information)
     */
    public function query(Request $request, Timesheet $timesheet): RedirectResponse
    {
        $user = Auth::user();

        // Verify access
        if ($timesheet->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        if (!$timesheet->canBeQueried()) {
            return redirect()->back()->with('error', 'This timesheet cannot be queried.');
        }

        $request->validate([
            'manager_notes' => 'required|string|max:1000'
        ]);

        $timesheet->update([
            'status' => Timesheet::STATUS_QUERIED,
            'manager_notes' => $request->manager_notes,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Query sent to worker successfully.');
    }

    /**
     * Reject a timesheet
     */
    public function reject(Request $request, Timesheet $timesheet): RedirectResponse
    {
        $user = Auth::user();

        // Verify access
        if ($timesheet->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        if (!$timesheet->canBeRejected()) {
            return redirect()->back()->with('error', 'This timesheet cannot be rejected.');
        }

        $request->validate([
            'manager_notes' => 'required|string|max:1000'
        ]);

        $timesheet->update([
            'status' => Timesheet::STATUS_REJECTED,
            'manager_notes' => $request->manager_notes,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Timesheet rejected successfully.');
    }

    /**
     * Bulk approve timesheets
     */
    public function bulkApprove(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'timesheet_ids' => 'required|array',
            'timesheet_ids.*' => 'exists:timesheets,id'
        ]);

        $timesheets = Timesheet::whereIn('id', $request->timesheet_ids)
            ->where('care_home_id', $user->care_home_id)
            ->where('status', Timesheet::STATUS_SUBMITTED)
            ->get();

        $count = 0;
        foreach ($timesheets as $timesheet) {
            $timesheet->update([
                'status' => Timesheet::STATUS_APPROVED,
                'approved_by' => $user->id,
                'approved_at' => now(),
            ]);
            $count++;
        }

        return redirect()->back()->with('success', "Approved {$count} timesheets successfully.");
    }

    /**
     * Show individual timesheet details
     */
    public function show(Timesheet $timesheet): Response
    {
        $user = Auth::user();

        // Verify access
        if ($timesheet->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        $timesheet->load(['worker.care_home', 'shift.careHome', 'approver', 'careHome']);

        return Inertia::render('Timesheets/Show', [
            'timesheet' => $timesheet,
            'statusOptions' => [
                'draft' => 'Draft',
                'submitted' => 'Submitted',
                'approved' => 'Approved',
                'queried' => 'Queried',
                'rejected' => 'Rejected',
            ]
        ]);
    }

    /**
     * Get timesheet statistics
     */
    private function getTimesheetStats($careHomeId, $dateFrom = null, $dateTo = null): array
    {
        $query = Timesheet::forCareHome($careHomeId);

        if ($dateFrom && $dateTo) {
            $query->byDateRange($dateFrom, $dateTo);
        }

        return [
            'total' => $query->count(),
            'pending' => $query->clone()->where('status', Timesheet::STATUS_SUBMITTED)->count(),
            'approved' => $query->clone()->where('status', Timesheet::STATUS_APPROVED)->count(),
            'queried' => $query->clone()->where('status', Timesheet::STATUS_QUERIED)->count(),
            'rejected' => $query->clone()->where('status', Timesheet::STATUS_REJECTED)->count(),
            'total_pending_pay' => $query->clone()->where('status', Timesheet::STATUS_SUBMITTED)->sum('total_pay'),
            'total_approved_pay' => $query->clone()->where('status', Timesheet::STATUS_APPROVED)->sum('total_pay'),
        ];
    }
}
