<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WalletManagementController extends Controller
{
    /**
     * Display all wallets
     */
    public function index()
    {
        $wallets = Wallet::with('owner')
            ->withCount('transactions')
            ->orderBy('balance', 'desc')
            ->paginate(20);

        // Calculate stats
        $stats = [
            'total_wallets' => Wallet::count(),
            'total_balance' => Wallet::sum('balance'),
            'total_credited' => Wallet::sum('total_credited'),
            'total_debited' => Wallet::sum('total_debited'),
        ];

        return Inertia::render('admin/wallets/index', [
            'wallets' => $wallets,
            'stats' => $stats,
        ]);
    }

    /**
     * Show specific wallet details
     */
    public function show($id)
    {
        $wallet = Wallet::with(['owner', 'transactions' => function($query) {
            $query->with(['performedBy', 'invoice', 'timesheet'])->latest();
        }])->findOrFail($id);

        $transactions = $wallet->transactions()->with(['performedBy', 'invoice', 'timesheet'])
            ->latest()
            ->paginate(20);

        $stats = [
            'total_credits' => $wallet->transactions()->where('type', 'credit')->sum('amount'),
            'total_debits' => $wallet->transactions()->where('type', 'debit')->sum('amount'),
            'transaction_count' => $wallet->transactions()->count(),
        ];

        return Inertia::render('admin/wallets/show', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'stats' => $stats,
        ]);
    }

    /**
     * Show form to credit a care home's wallet
     */
    public function creditForm($ownerType, $ownerId)
    {
        if ($ownerType === 'care_home') {
            $owner = CareHome::findOrFail($ownerId);
        } else {
            $owner = User::findOrFail($ownerId);
        }

        $wallet = Wallet::getOrCreateFor($owner);

        return Inertia::render('admin/wallets/credit', [
            'owner' => $owner,
            'ownerType' => $ownerType,
            'wallet' => $wallet,
        ]);
    }

    /**
     * Credit a wallet
     */
    public function credit(Request $request)
    {
        $request->validate([
            'owner_type' => 'required|in:care_home,user',
            'owner_id' => 'required|uuid',
            'amount' => 'required|numeric|min:0.01|max:1000000',
            'reason' => 'required|string|max:500',
            'proof_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        try {
            // Get owner
            if ($request->owner_type === 'care_home') {
                $owner = CareHome::findOrFail($request->owner_id);
            } else {
                $owner = User::findOrFail($request->owner_id);
            }

            // Get or create wallet
            $wallet = Wallet::getOrCreateFor($owner);

            // Handle proof file upload
            $proofFilePath = null;
            if ($request->hasFile('proof_file')) {
                $proofFilePath = $request->file('proof_file')->store(
                    'wallet-proofs/' . $request->owner_type . '/' . $request->owner_id,
                    'private'
                );
            }

            // Credit the wallet
            $transaction = $wallet->credit(
                amount: $request->amount,
                category: Transaction::CATEGORY_MANUAL_CREDIT,
                description: "Manual credit by admin: {$request->reason}",
                reason: $request->reason,
                proofFilePath: $proofFilePath,
                performedBy: Auth::user(),
                metadata: [
                    'admin_id' => Auth::id(),
                    'admin_name' => Auth::user()->name,
                ]
            );

            // Create notification for the wallet owner
            if ($request->owner_type === 'care_home') {
                // Notify care home admin
                $careHomeAdmin = User::where('care_home_id', $request->owner_id)
                    ->where('role', 'care_home_admin')
                    ->first();
                
                if ($careHomeAdmin) {
                    Notification::create([
                        'user_id' => $careHomeAdmin->id,
                        'type' => 'wallet_credited',
                        'title' => 'Wallet Credited',
                        'message' => "Your wallet has been credited with £" . number_format($request->amount, 2) . ". Reason: {$request->reason}",
                        'data' => json_encode([
                            'transaction_id' => $transaction->id,
                            'amount' => $request->amount,
                            'new_balance' => $wallet->balance,
                        ]),
                    ]);
                }
            } else {
                // Notify user
                Notification::create([
                    'user_id' => $request->owner_id,
                    'type' => 'wallet_credited',
                    'title' => 'Wallet Credited',
                    'message' => "Your wallet has been credited with £" . number_format($request->amount, 2) . ". Reason: {$request->reason}",
                    'data' => json_encode([
                        'transaction_id' => $transaction->id,
                        'amount' => $request->amount,
                        'new_balance' => $wallet->balance,
                    ]),
                ]);
            }

            return redirect()
                ->route('admin.wallets.show', $wallet->id)
                ->with('success', "Successfully credited £" . number_format($request->amount, 2) . " to wallet");

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to credit wallet: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show form to debit a care home's wallet
     */
    public function debitForm($ownerType, $ownerId)
    {
        if ($ownerType === 'care_home') {
            $owner = CareHome::findOrFail($ownerId);
        } else {
            $owner = User::findOrFail($ownerId);
        }

        $wallet = Wallet::getOrCreateFor($owner);

        return Inertia::render('admin/wallets/debit', [
            'owner' => $owner,
            'ownerType' => $ownerType,
            'wallet' => $wallet,
        ]);
    }

    /**
     * Debit a wallet
     */
    public function debit(Request $request)
    {
        $request->validate([
            'owner_type' => 'required|in:care_home,user',
            'owner_id' => 'required|uuid',
            'amount' => 'required|numeric|min:0.01|max:1000000',
            'reason' => 'required|string|max:500',
            'proof_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        try {
            // Get owner
            if ($request->owner_type === 'care_home') {
                $owner = CareHome::findOrFail($request->owner_id);
            } else {
                $owner = User::findOrFail($request->owner_id);
            }

            // Get or create wallet
            $wallet = Wallet::getOrCreateFor($owner);

            // Check sufficient balance
            if (!$wallet->hasSufficientBalance($request->amount)) {
                return redirect()->back()
                    ->withErrors(['amount' => 'Insufficient balance. Current balance: £' . number_format($wallet->balance, 2)])
                    ->withInput();
            }

            // Handle proof file upload
            $proofFilePath = null;
            if ($request->hasFile('proof_file')) {
                $proofFilePath = $request->file('proof_file')->store(
                    'wallet-proofs/' . $request->owner_type . '/' . $request->owner_id,
                    'private'
                );
            }

            // Debit the wallet
            $transaction = $wallet->debit(
                amount: $request->amount,
                category: Transaction::CATEGORY_MANUAL_DEBIT,
                description: "Manual debit by admin: {$request->reason}",
                reason: $request->reason,
                proofFilePath: $proofFilePath,
                performedBy: Auth::user(),
                metadata: [
                    'admin_id' => Auth::id(),
                    'admin_name' => Auth::user()->name,
                ]
            );

            // Create notification for the wallet owner
            if ($request->owner_type === 'care_home') {
                // Notify care home admin
                $careHomeAdmin = User::where('care_home_id', $request->owner_id)
                    ->where('role', 'care_home_admin')
                    ->first();
                
                if ($careHomeAdmin) {
                    Notification::create([
                        'user_id' => $careHomeAdmin->id,
                        'type' => 'wallet_debited',
                        'title' => 'Wallet Debited',
                        'message' => "£" . number_format($request->amount, 2) . " has been debited from your wallet. Reason: {$request->reason}",
                        'data' => json_encode([
                            'transaction_id' => $transaction->id,
                            'amount' => $request->amount,
                            'new_balance' => $wallet->balance,
                        ]),
                    ]);
                }
            } else {
                // Notify user
                Notification::create([
                    'user_id' => $request->owner_id,
                    'type' => 'wallet_debited',
                    'title' => 'Wallet Debited',
                    'message' => "£" . number_format($request->amount, 2) . " has been debited from your wallet. Reason: {$request->reason}",
                    'data' => json_encode([
                        'transaction_id' => $transaction->id,
                        'amount' => $request->amount,
                        'new_balance' => $wallet->balance,
                    ]),
                ]);
            }

            return redirect()
                ->route('admin.wallets.show', $wallet->id)
                ->with('success', "Successfully debited £" . number_format($request->amount, 2) . " from wallet");

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to debit wallet: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Download proof document
     */
    public function downloadProof(Transaction $transaction)
    {
        if (!$transaction->proof_file_path) {
            abort(404, 'No proof file found');
        }

        if (!Storage::disk('private')->exists($transaction->proof_file_path)) {
            abort(404, 'Proof file not found');
        }

        return Storage::disk('private')->download($transaction->proof_file_path);
    }
}
