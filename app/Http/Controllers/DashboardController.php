<?php

namespace App\Http\Controllers;

use App\DocumentVerificationStatus;
use App\Models\CareHome;
use App\Models\Document;
use App\Models\Shift;
use App\Models\Timesheet;
use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the care home dashboard
     */
    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();
        
        // Redirect admin users to admin dashboard
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        
        // Redirect healthcare workers to worker dashboard
        if ($user->isHealthCareWorker()) {
            return redirect()->route('worker.dashboard');
        }
        
        // Reload the care_home relationship to ensure it's fresh
        $user->load('care_home');
        $careHome = $user->care_home;
        
        if (!$careHome) {
            return redirect()->route('register.carehome');
        }

        // Get recent unread notifications for the user
        $notifications = $user->notifications()
            ->where('read', false)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $careHomeData = [
            'id' => $careHome->id,
            'name' => $careHome->name,
            'status' => $careHome->status,
        ];

        // Approved care homes get the full operational dashboard
        if ($careHome->status === 'approved') {
            $upcomingShifts = Shift::where('care_home_id', $careHome->id)
                ->whereIn('status', ['published', 'filled'])
                ->where('start_datetime', '>=', now())
                ->orderBy('start_datetime')
                ->limit(5)
                ->get();

            $dashboardStats = [
                'active_shifts'         => Shift::where('care_home_id', $careHome->id)->where('status', 'published')->count(),
                'filled_shifts'         => Shift::where('care_home_id', $careHome->id)->where('status', 'filled')->count(),
                'pending_timesheets'    => Timesheet::where('care_home_id', $careHome->id)->where('status', 'pending')->count(),
                'approved_timesheets'   => Timesheet::where('care_home_id', $careHome->id)->where('status', 'approved')->count(),
                'outstanding_invoices'  => Invoice::where('care_home_id', $careHome->id)->whereIn('status', ['pending', 'sent', 'overdue'])->count(),
                'outstanding_amount'    => Invoice::where('care_home_id', $careHome->id)->whereIn('status', ['pending', 'sent', 'overdue'])->sum('total'),
                'uninvoiced_timesheets' => Timesheet::where('care_home_id', $careHome->id)->where('status', 'approved')->whereDoesntHave('invoices')->count(),
            ];

            return Inertia::render('dashboard', [
                'careHome'       => $careHomeData,
                'notifications'  => $notifications,
                'upcomingShifts' => $upcomingShifts,
                'dashboardStats' => $dashboardStats,
            ]);
        }

        // Non-approved care homes see the document verification dashboard
        $documents = $careHome->documents()->with('reviewer')->get();

        $verificationStatuses = collect(DocumentVerificationStatus::cases())->map(function ($status) {
            return [
                'value'           => $status->value,
                'displayName'     => $status->getDisplayName(),
                'description'     => $status->getDescription(),
                'color'           => $status->getColor(),
                'icon'            => $status->getIcon(),
                'isActionRequired'=> $status->isActionRequired(),
            ];
        });

        return Inertia::render('dashboard', [
            'careHome'            => $careHomeData,
            'documents'           => $documents,
            'notifications'       => $notifications,
            'verificationStatuses'=> $verificationStatuses,
        ]);
    }
}
