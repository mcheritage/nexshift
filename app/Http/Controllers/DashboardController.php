<?php

namespace App\Http\Controllers;

use App\DocumentVerificationStatus;
use App\Models\CareHome;
use App\Models\Document;
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

        // Get all documents for this care home
        $documents = $careHome->documents()->with('reviewer')->get();

        // Get recent notifications for the user
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get verification statuses with their metadata
        $verificationStatuses = collect(DocumentVerificationStatus::cases())->map(function ($status) {
            return [
                'value' => $status->value,
                'displayName' => $status->getDisplayName(),
                'description' => $status->getDescription(),
                'color' => $status->getColor(),
                'icon' => $status->getIcon(),
                'isActionRequired' => $status->isActionRequired(),
            ];
        });

        return Inertia::render('dashboard', [
            'careHome' => [
                'id' => $careHome->id,
                'name' => $careHome->name,
                'status' => $careHome->status,
            ],
            'documents' => $documents,
            'notifications' => $notifications,
            'verificationStatuses' => $verificationStatuses,
        ]);
    }
}
