<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinancesController extends Controller
{
    /**
     * Display worker finances dashboard
     */
    public function index()
    {
        $user = Auth::user();

        // Get or create wallet
        $wallet = Wallet::getOrCreateFor($user);

        // Get recent transactions
        $transactions = $wallet->transactions()
            ->with(['performedBy', 'invoice', 'timesheet'])
            ->latest()
            ->paginate(15);

        // Calculate stats
        $stats = [
            'wallet_balance' => $wallet->balance,
            'total_earned' => $wallet->total_credited,
            'monthly_earnings' => $wallet->transactions()
                ->where('type', 'credit')
                ->whereMonth('created_at', now()->month)
                ->sum('amount'),
            'total_transactions' => $wallet->transactions()->count(),
        ];

        // Get earnings breakdown by category
        $earningsBreakdown = [
            'timesheet_payments' => $wallet->transactions()
                ->where('type', 'credit')
                ->where('category', 'timesheet_payment')
                ->sum('amount'),
            'manual_credits' => $wallet->transactions()
                ->where('type', 'credit')
                ->where('category', 'manual_credit')
                ->sum('amount'),
            'refunds' => $wallet->transactions()
                ->where('type', 'credit')
                ->where('category', 'refund')
                ->sum('amount'),
        ];

        return Inertia::render('Worker/finances/index', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'stats' => $stats,
            'earningsBreakdown' => $earningsBreakdown,
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
