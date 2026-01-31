<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Timesheet;
use App\Services\StripeConnectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class FinancesController extends Controller
{
    protected StripeConnectService $stripeService;

    public function __construct(StripeConnectService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Display worker finances dashboard
     */
    public function index()
    {
        $user = Auth::user();

        // Get Stripe account status
        $stripeStatus = null;
        $stripeBalance = null;
        
        if ($user->stripe_account_id) {
            try {
                $stripeStatus = $this->stripeService->updateAccountStatus($user);
                
                // Get Stripe balance if account is fully set up
                if ($user->stripe_onboarding_complete && $user->stripe_payouts_enabled) {
                    try {
                        $stripeBalance = $this->stripeService->getAccountBalance($user);
                    } catch (\Exception $e) {
                        \Log::error('Failed to get Stripe balance', [
                            'user_id' => $user->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to get Stripe status', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Get timesheet statistics
        $timesheetStats = [
            // Total hours worked (only paid timesheets)
            'total_hours_worked' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_PAID)
                ->sum('total_hours'),
            
            // Hours this month (only paid)
            'hours_this_month' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_PAID)
                ->whereMonth('approved_at', now()->month)
                ->whereYear('approved_at', now()->year)
                ->sum('total_hours'),
            
            // Hours last month
            'hours_last_month' => (float) Timesheet::where('worker_id', $user->id)
                ->whereIn('status', [Timesheet::STATUS_APPROVED, Timesheet::STATUS_PAID])
                ->whereMonth('approved_at', now()->subMonth()->month)
                ->whereYear('approved_at', now()->subMonth()->year)
                ->sum('total_hours'),
            
            // Pending approval hours (submitted but not approved)
            'pending_approval_hours' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_SUBMITTED)
                ->sum('total_hours'),
            
            // Pending payment hours (approved but not paid)
            'pending_payment_hours' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_APPROVED)
                ->sum('total_hours'),
        ];

        // Calculate earnings stats from timesheets
        $stats = [
            // Total earned from paid timesheets only
            'total_earned' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_PAID)
                ->sum('total_pay'),
            
            // Monthly earnings from paid timesheets only
            'monthly_earnings' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_PAID)
                ->whereMonth('approved_at', now()->month)
                ->whereYear('approved_at', now()->year)
                ->sum('total_pay'),
            
            // Last month earnings
            'last_month_earnings' => (float) Timesheet::where('worker_id', $user->id)
                ->whereIn('status', [Timesheet::STATUS_APPROVED, Timesheet::STATUS_PAID])
                ->whereMonth('approved_at', now()->subMonth()->month)
                ->whereYear('approved_at', now()->subMonth()->year)
                ->sum('total_pay'),
            
            // Pending approval earnings (from submitted timesheets)
            'pending_approval_earnings' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_SUBMITTED)
                ->sum('total_pay'),
            
            // Pending payment earnings (from approved but not paid timesheets)
            'pending_payment_earnings' => (float) Timesheet::where('worker_id', $user->id)
                ->where('status', Timesheet::STATUS_APPROVED)
                ->sum('total_pay'),
            
            // Total approved timesheets (approved + paid)
            'total_approved_timesheets' => Timesheet::where('worker_id', $user->id)
                ->whereIn('status', [Timesheet::STATUS_APPROVED, Timesheet::STATUS_PAID])
                ->count(),
        ];

        // Get recent approved/paid timesheets
        $recentTimesheets = Timesheet::where('worker_id', $user->id)
            ->whereIn('status', [Timesheet::STATUS_APPROVED, Timesheet::STATUS_PAID, Timesheet::STATUS_SUBMITTED])
            ->with(['shift.careHome'])
            ->latest('approved_at')
            ->limit(10)
            ->get();

        return Inertia::render('Worker/finances/index', [
            'stats' => $stats,
            'timesheetStats' => $timesheetStats,
            'recentTimesheets' => $recentTimesheets,
            'stripeConnected' => (bool) $user->stripe_account_id,
            'stripeOnboardingComplete' => (bool) $user->stripe_onboarding_complete,
            'stripeStatus' => $stripeStatus,
            'stripeBalance' => $stripeBalance,
        ]);
    }

    /**
     * View transaction details
     */
    public function showTransaction($id)
    {
        $user = Auth::user();
        $wallet = Wallet::getOrCreateFor($user);

        $transaction = $wallet->transactions()
            ->with(['performedBy', 'invoice', 'timesheet.shift.careHome'])
            ->findOrFail($id);

        return Inertia::render('Worker/finances/transaction-details', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Request withdrawal (future feature)
     */
    public function withdrawalRequest(Request $request)
    {
        // This can be implemented later for bank withdrawal feature
        return response()->json(['message' => 'Withdrawal feature coming soon']);
    }
}
