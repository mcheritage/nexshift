<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Document;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Show the admin dashboard
     */
    public function index(): Response
    {
        // Get overall statistics
        $stats = [
            'total_care_homes' => CareHome::count(),
            'pending_care_homes' => CareHome::where('status', 'pending')->count(),
            'health_care_workers' => User::where('role', 'health_worker')->count(),
            'pending_workers' => User::where('role', 'health_worker')->where('status', 'pending')->count(),
            'pending_documents' => Document::where('status', 'pending')->count(),
            'requires_attention_documents' => Document::where('status', 'requires_attention')->count(),
        ];

        // Get recent activity
        $recentDocuments = Document::with(['careHome', 'user', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentCareHomes = CareHome::with('users')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentUsers = User::with('care_home')
            ->where('role', 'health_worker')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $careHomes = CareHome::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentDocuments' => $recentDocuments,
            'recentCareHomes' => $recentCareHomes,
            'recentUsers' => $recentUsers,
            'careHomes' => $careHomes,
        ]);
    }
}
