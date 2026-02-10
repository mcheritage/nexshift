<?php

namespace App\Http\Controllers\CareHome;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinancesController extends Controller
{
    /**
     * Display finances dashboard
     */
    public function index()
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'No care home associated');
        }

        // Get unpaid invoices
        $unpaidInvoices = Invoice::where('care_home_id', $careHome->id)
            ->whereIn('status', [Invoice::STATUS_SENT, Invoice::STATUS_OVERDUE])
            ->with('timesheets.worker')
            ->latest()
            ->get();

        // Get paid invoices for this month
        $paidInvoicesThisMonth = Invoice::where('care_home_id', $careHome->id)
            ->where('status', Invoice::STATUS_PAID)
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->get();

        // Get all paid invoices
        $totalPaidInvoices = Invoice::where('care_home_id', $careHome->id)
            ->where('status', Invoice::STATUS_PAID)
            ->get();

        // Get recent paid invoices
        $recentInvoices = Invoice::where('care_home_id', $careHome->id)
            ->where('status', Invoice::STATUS_PAID)
            ->with('timesheets.worker')
            ->latest('paid_at')
            ->limit(10)
            ->get();

        // Calculate stats
        $stats = [
            'pending_invoices_count' => $unpaidInvoices->count(),
            'pending_invoices_total' => (float) $unpaidInvoices->sum('total'),
            'total_spent' => (float) $totalPaidInvoices->sum('total'),
            'monthly_spent' => (float) $paidInvoicesThisMonth->sum('total'),
        ];

        return Inertia::render('carehome/finances/index', [
            'unpaidInvoices' => ['data' => $unpaidInvoices],
            'recentInvoices' => ['data' => $recentInvoices],
            'stats' => $stats,
        ]);
    }

    /**
     * Pay an invoice using wallet balance
     */
    public function payInvoice(Request $request, Invoice $invoice)
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        // Verify invoice belongs to this care home
        if ($invoice->care_home_id !== $careHome->id) {
            abort(403, 'Access denied');
        }

        // Check if invoice is already paid
        if ($invoice->status === Invoice::STATUS_PAID) {
            return redirect()->back()->with('error', 'This invoice is already paid.');
        }

        try {
            DB::transaction(function () use ($invoice, $careHome, $user) {
                // Get care home wallet
                $careHomeWallet = Wallet::getOrCreateFor($careHome);

                // Check sufficient balance
                if (!$careHomeWallet->hasSufficientBalance($invoice->total)) {
                    throw new \Exception('Insufficient wallet balance. Please top up your wallet first.');
                }

                // Debit care home wallet
                $careHomeTransaction = $careHomeWallet->debit(
                    amount: $invoice->total,
                    category: Transaction::CATEGORY_INVOICE_PAYMENT,
                    description: "Payment for invoice #{$invoice->invoice_number}",
                    performedBy: $user,
                    metadata: [
                        'invoice_id' => $invoice->id,
                        'invoice_number' => $invoice->invoice_number,
                    ]
                );

                // Credit each worker's wallet for their timesheets in this invoice
                foreach ($invoice->timesheets as $timesheet) {
                    $worker = $timesheet->user;
                    $workerWallet = Wallet::getOrCreateFor($worker);

                    $workerTransaction = $workerWallet->credit(
                        amount: $timesheet->total_pay,
                        category: Transaction::CATEGORY_TIMESHEET_PAYMENT,
                        description: "Payment for timesheet #{$timesheet->id} from {$careHome->name}",
                        performedBy: $user,
                        metadata: [
                            'timesheet_id' => $timesheet->id,
                            'invoice_id' => $invoice->id,
                            'invoice_number' => $invoice->invoice_number,
                            'care_home_id' => $careHome->id,
                        ]
                    );

                    // Link transaction to timesheet
                    $workerTransaction->update([
                        'timesheet_id' => $timesheet->id,
                        'invoice_id' => $invoice->id,
                    ]);

                    // Notify worker about payment
                    Notification::create([
                        'user_id' => $worker->id,
                        'type' => 'payment_received',
                        'title' => 'Payment Received',
                        'message' => "You've received £" . number_format($timesheet->total_pay, 2) . " for your timesheet from {$careHome->name}",
                        'data' => json_encode([
                            'transaction_id' => $workerTransaction->id,
                            'amount' => $timesheet->total_pay,
                            'invoice_number' => $invoice->invoice_number,
                            'care_home' => $careHome->name,
                        ]),
                    ]);
                    
                    // Send email to worker
                    try {
                        \Mail::to($worker->email)->send(
                            new \App\Mail\PaymentReceived(
                                $timesheet->total_pay,
                                $invoice,
                                $careHome->name
                            )
                        );
                    } catch (\Exception $e) {
                        \Log::error('Failed to send payment received email to worker', [
                            'worker_id' => $worker->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                // Mark invoice as paid
                $invoice->update([
                    'status' => Invoice::STATUS_PAID,
                    'paid_at' => now(),
                    'payment_method' => 'wallet',
                    'transaction_id' => $careHomeTransaction->transaction_id,
                    'paid_by_user_id' => $user->id,
                ]);

                // Link transaction to invoice
                $careHomeTransaction->update([
                    'invoice_id' => $invoice->id,
                ]);
            });

            // Send email to care home confirming payment
            try {
                \Mail::to($careHome->email)->send(
                    new \App\Mail\InvoicePaid($invoice)
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send invoice paid email to care home', [
                    'care_home_id' => $careHome->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return redirect()->back()->with('success', 'Invoice paid successfully using wallet balance.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * View invoices
     */
    public function invoices()
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        $invoices = Invoice::where('care_home_id', $careHome->id)
            ->with('timesheets.worker')
            ->latest()
            ->paginate(15);

        return Inertia::render('carehome/finances/invoices', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * View single invoice
     */
    public function showInvoice(Invoice $invoice)
    {
        $user = Auth::user();

        if ($invoice->care_home_id !== $user->care_home_id) {
            abort(403, 'Access denied');
        }

        $invoice->load('timesheets.worker', 'timesheets.shift', 'careHome');
        
        $wallet = Wallet::getOrCreateFor($user->care_home);

        return Inertia::render('carehome/finances/invoice-details', [
            'invoice' => $invoice,
            'wallet' => $wallet,
        ]);
    }
}
