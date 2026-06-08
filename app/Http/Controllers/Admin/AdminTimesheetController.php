<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTimesheetController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Timesheet::with([
                'worker:id,first_name,last_name,email',
                'careHome:id,name',
                'shift:id,title,role',
            ])
            ->orderBy('clock_in_time', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('worker', function ($w) use ($search) {
                    $w->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                })
                ->orWhereHas('careHome', function ($ch) use ($search) {
                    $ch->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('shift', function ($s) use ($search) {
                    $s->where('title', 'like', "%{$search}%")
                      ->orWhere('role', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('care_home_id')) {
            $query->where('care_home_id', $request->care_home_id);
        }

        if ($request->filled('worker_id')) {
            $query->where('worker_id', $request->worker_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('clock_in_time', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('clock_in_time', '<=', $request->date_to);
        }

        $timesheets = $query->limit(1000)->get();

        $stats = [
            'total'     => Timesheet::count(),
            'submitted' => Timesheet::where('status', Timesheet::STATUS_SUBMITTED)->count(),
            'approved'  => Timesheet::where('status', Timesheet::STATUS_APPROVED)->count(),
            'queried'   => Timesheet::where('status', Timesheet::STATUS_QUERIED)->count(),
        ];

        $careHomes = CareHome::select('id', 'name')->orderBy('name')->get();

        $workers = User::where('role', 'health_worker')
            ->select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('admin/timesheets/index', [
            'timesheets' => $timesheets,
            'stats'      => $stats,
            'careHomes'  => $careHomes,
            'workers'    => $workers,
            'filters'    => $request->only(['search', 'status', 'care_home_id', 'worker_id', 'date_from', 'date_to']),
        ]);
    }
}
