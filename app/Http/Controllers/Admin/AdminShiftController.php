<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CareHome;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminShiftController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Shift::with([
                'careHome:id,name',
                'selectedWorker:id,first_name,last_name,email',
                'applications' => function ($q) {
                    $q->whereIn('status', [Application::STATUS_ASSIGNED, Application::STATUS_ACCEPTED])
                      ->select('id', 'shift_id', 'worker_id', 'status');
                },
            ])
            ->withCount(['applications', 'applications as pending_applications_count' => function ($q) {
                $q->where('status', Application::STATUS_PENDING);
            }])
            ->orderBy('start_datetime', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('care_home_id')) {
            $query->where('care_home_id', $request->care_home_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('start_datetime', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('start_datetime', '<=', $request->date_to);
        }

        $shifts = $query->paginate(20)->withQueryString();

        // Tag each shift with whether the current assignment is still pending worker acceptance
        $shifts->each(function ($shift) {
            $shift->is_pending_assignment = $shift->selected_worker_id
                && $shift->applications->contains(function ($app) use ($shift) {
                    return $app->worker_id === $shift->selected_worker_id
                        && $app->status === Application::STATUS_ASSIGNED;
                });
            unset($shift->applications); // don't leak raw application data to the frontend
        });

        $careHomes = CareHome::select('id', 'name')->orderBy('name')->get();

        $workers = User::where('role', 'health_worker')
            ->where('status', 'approved')
            ->select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();

        $stats = [
            'total'       => Shift::count(),
            'published'   => Shift::where('status', Shift::STATUS_PUBLISHED)->count(),
            'filled'      => Shift::where('status', Shift::STATUS_FILLED)->count(),
            'completed'   => Shift::where('status', Shift::STATUS_COMPLETED)->count(),
        ];

        return Inertia::render('admin/shifts/index', [
            'shifts'    => $shifts,
            'careHomes' => $careHomes,
            'workers'   => $workers,
            'stats'     => $stats,
            'filters'   => $request->only(['status', 'care_home_id', 'date_from', 'date_to']),
        ]);
    }

    public function assign(Request $request, Shift $shift): RedirectResponse
    {
        $request->validate([
            'worker_id' => 'required|exists:users,id',
        ]);

        if (!in_array($shift->status, [Shift::STATUS_PUBLISHED, Shift::STATUS_FILLED])) {
            return redirect()->back()->withErrors(['error' => 'Only published or filled shifts can be assigned.']);
        }

        $worker = User::findOrFail($request->worker_id);

        // If the shift already has a different worker assigned (filled), clear them first
        if ($shift->selected_worker_id && $shift->selected_worker_id !== $worker->id) {
            Application::where('shift_id', $shift->id)
                ->where('worker_id', $shift->selected_worker_id)
                ->whereIn('status', [Application::STATUS_ACCEPTED, Application::STATUS_ASSIGNED])
                ->update(['status' => Application::STATUS_REJECTED]);
        }

        // Create or update the application for this worker
        Application::updateOrCreate(
            ['shift_id' => $shift->id, 'worker_id' => $worker->id],
            [
                'status'      => Application::STATUS_ASSIGNED,
                'applied_at'  => now(),
                'reviewed_at' => now(),
                'reviewed_by' => Auth::id(),
                'review_notes' => 'Assigned by admin — pending worker acceptance.',
            ]
        );

        // Tentatively mark the shift as filled with this worker
        $shift->update([
            'selected_worker_id' => $worker->id,
            'status'             => Shift::STATUS_FILLED,
        ]);

        return redirect()->back()->with('success', "Shift assigned to {$worker->first_name} {$worker->last_name}. They will be notified to accept.");
    }

    public function unassign(Shift $shift): RedirectResponse
    {
        if (!$shift->selected_worker_id) {
            return redirect()->back()->withErrors(['error' => 'No worker is currently assigned to this shift.']);
        }

        Application::where('shift_id', $shift->id)
            ->where('worker_id', $shift->selected_worker_id)
            ->whereIn('status', [Application::STATUS_ASSIGNED, Application::STATUS_ACCEPTED])
            ->update(['status' => Application::STATUS_REJECTED]);

        $shift->update([
            'selected_worker_id' => null,
            'status'             => Shift::STATUS_PUBLISHED,
        ]);

        return redirect()->back()->with('success', 'Worker unassigned. Shift is now open again.');
    }
}
