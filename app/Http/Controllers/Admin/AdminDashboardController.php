<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'total_users' => User::count(),
            'total_documents' => Document::count(),
            'pending_documents' => Document::where('status', 'pending')->count(),
            'approved_documents' => Document::where('status', 'approved')->count(),
            'rejected_documents' => Document::where('status', 'rejected')->count(),
            'requires_attention_documents' => Document::where('status', 'requires_attention')->count(),
            'admin_users' => User::where('role', 'admin')->count(),
            'care_home_admins' => User::where('role', 'care_home_admin')->count(),
            'health_care_workers' => User::where('role', 'health_care_worker')->count(),
        ];

        // Get recent activity
        $recentDocuments = Document::with(['careHome', 'user', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentCareHomes = CareHome::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentUsers = User::with('care_home')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentDocuments' => $recentDocuments,
            'recentCareHomes' => $recentCareHomes,
            'recentUsers' => $recentUsers,
        ]);
    }
}
