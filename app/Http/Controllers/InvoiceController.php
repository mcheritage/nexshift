<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Timesheet;
use App\Models\Wallet;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices for the care home
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'Access denied: No care home associated');
        }

        // Get filters
        $status = $request->get('status', '');
        $search = $request->get('search');

        // Get approved timesheets that haven't been invoiced yet
        $availableTimesheets = Timesheet::where('care_home_id', $careHome->id)
            ->where('status', 'approved')
            ->whereDoesntHave('invoices')
            ->with(['worker', 'shift'])
            ->orderBy('approved_at', 'desc')
            ->get();

        // Build query
        $query = Invoice::where('care_home_id', $careHome->id)
            ->with('timesheets');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where('invoice_number', 'like', '%' . $search . '%');
        }

        $invoices = $query->orderBy('invoice_date', 'desc')
            ->paginate(20);

        // Get statistics
        $stats = [
            'total' => Invoice::where('care_home_id', $careHome->id)->count(),
            'draft' => Invoice::where('care_home_id', $careHome->id)->where('status', 'draft')->count(),
            'sent' => Invoice::where('care_home_id', $careHome->id)->where('status', 'sent')->count(),
            'paid' => Invoice::where('care_home_id', $careHome->id)->where('status', 'paid')->count(),
            'overdue' => Invoice::where('care_home_id', $careHome->id)->where('status', 'overdue')->count(),
            'uninvoiced_timesheets' => $availableTimesheets->count(),
            'uninvoiced_total' => $availableTimesheets->sum('total_pay'),
            'total_outstanding' => Invoice::where('care_home_id', $careHome->id)
                ->whereIn('status', ['sent', 'overdue'])
                ->sum('total'),
            'total_paid' => Invoice::where('care_home_id', $careHome->id)
                ->where('status', 'paid')
                ->sum('total'),
        ];

        \Log::info('Invoice Index Data', [
            'invoices_count' => $invoices->total(),
            'available_timesheets' => $availableTimesheets->count(),
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);

        return Inertia::render('Invoices/Index', [
            'availableTimesheets' => $availableTimesheets,
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'statusOptions' => [
                'draft' => 'Draft',
                'sent' => 'Sent',
                'paid' => 'Paid',
                'overdue' => 'Overdue',
                'cancelled' => 'Cancelled',
            ],
        ]);
    }

    /**
     * Show the form for creating a new invoice
     */
    public function create(): Response
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'Access denied: No care home associated');
        }

        // Get approved timesheets that haven't been invoiced yet
        $availableTimesheets = Timesheet::where('care_home_id', $careHome->id)
            ->where('status', 'approved')
            ->whereDoesntHave('invoices')
            ->with(['worker', 'shift'])
            ->orderBy('approved_at', 'desc')
            ->get();

        return Inertia::render('Invoices/Create', [
            'availableTimesheets' => $availableTimesheets,
        ]);
    }

    /**
     * Store a newly created invoice from selected timesheets
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            abort(403, 'Access denied: No care home associated');
        }

        $validated = $request->validate([
            'timesheet_ids' => 'required|array|min:1',
            'timesheet_ids.*' => 'exists:timesheets,id',
        ]);

        DB::beginTransaction();
        try {
            // Get the timesheets
            $timesheets = Timesheet::whereIn('id', $validated['timesheet_ids'])
                ->where('care_home_id', $careHome->id)
                ->where('status', 'approved')
                ->whereDoesntHave('invoices')
                ->get();

            if ($timesheets->isEmpty()) {
                return back()->withErrors(['timesheet_ids' => 'No valid timesheets found']);
            }

            // Calculate period from timesheets
            $periodStart = $timesheets->min('clock_in_time');
            $periodEnd = $timesheets->max('clock_out_time');

            // Calculate totals
            $subtotal = $timesheets->sum('total_pay');
            $taxRate = 0.00; // No tax by default
            $taxAmount = 0;
            $total = $subtotal;

            // Create invoice
            $invoice = Invoice::create([
                'care_home_id' => $careHome->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'invoice_date' => now(),
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'subtotal' => $subtotal,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'status' => 'draft',
                'due_date' => now()->addDays(7),
                'notes' => "Invoice for {$timesheets->count()} approved timesheet(s)",
            ]);

            // Attach timesheets to invoice
            $invoice->timesheets()->attach($timesheets->pluck('id'));

            DB::commit();

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Invoice created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create invoice: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified invoice
     */
    public function show(Invoice $invoice): Response
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome || $invoice->care_home_id !== $careHome->id) {
            abort(403, 'Access denied');
        }

        $invoice->load(['timesheets.worker', 'timesheets.shift', 'careHome']);
        
        // Get care home wallet balance
        $wallet = Wallet::getOrCreateFor($careHome);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'wallet' => $wallet,
        ]);
    }

    /**
     * Mark invoice as sent
     */
    public function markAsSent(Invoice $invoice)
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome || $invoice->care_home_id !== $careHome->id) {
            abort(403, 'Access denied');
        }

        $invoice->update(['status' => 'sent']);

        return back()->with('success', 'Invoice marked as sent');
    }

    /**
     * Mark invoice as paid
     */
    public function markAsPaid(Invoice $invoice)
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome || $invoice->care_home_id !== $careHome->id) {
            abort(403, 'Access denied');
        }

        // Check if already paid
        if ($invoice->status === 'paid') {
            return back()->with('error', 'Invoice is already paid');
        }

        // Get care home wallet
        $careHomeWallet = Wallet::getOrCreateFor($careHome);

        // Check if care home has sufficient balance
        if ($careHomeWallet->balance < $invoice->total) {
            return back()->with('error', 'Insufficient balance. Your wallet balance is £' . number_format($careHomeWallet->balance, 2) . ' but the invoice total is £' . number_format($invoice->total, 2));
        }

        DB::transaction(function () use ($invoice, $careHome, $careHomeWallet) {
            // Load timesheets with workers
            $invoice->load('timesheets.worker');

            // Group timesheets by worker to calculate individual payments
            $workerPayments = $invoice->timesheets->groupBy('worker_id')->map(function ($timesheets) {
                return [
                    'worker' => $timesheets->first()->worker,
                    'total_pay' => $timesheets->sum('total_pay'),
                ];
            });

            // Process payment to each worker
            foreach ($workerPayments as $workerId => $payment) {
                $worker = $payment['worker'];
                $amount = $payment['total_pay'];

                // Get or create worker wallet
                $workerWallet = Wallet::getOrCreateFor($worker);

                // Debit from care home wallet
                $careHomeWallet->debit(
                    amount: $amount,
                    category: 'invoice_payment',
                    description: "Payment for invoice {$invoice->invoice_number} to {$worker->first_name} {$worker->last_name}",
                    reason: "Invoice payment to healthcare worker",
                    performedBy: auth()->user(),
                    metadata: [
                        'invoice_id' => $invoice->id,
                        'worker_id' => $workerId,
                    ]
                );

                // Credit to worker wallet
                $workerWallet->credit(
                    amount: $amount,
                    category: 'timesheet_payment',
                    description: "Payment received for invoice {$invoice->invoice_number}",
                    reason: "Timesheet payment from {$careHome->name}",
                    performedBy: auth()->user(),
                    metadata: [
                        'invoice_id' => $invoice->id,
                        'care_home_id' => $careHome->id,
                    ]
                );
                
                // Create notification for worker
                Notification::create([
                    'user_id' => $workerId,
                    'type' => 'payment_received',
                    'title' => 'Payment Received',
                    'message' => "You have received a payment of £" . number_format($amount, 2) . " from {$careHome->name} for invoice {$invoice->invoice_number}.",
                    'data' => [
                        'amount' => $amount,
                        'invoice_id' => $invoice->id,
                        'invoice_number' => $invoice->invoice_number,
                        'care_home_name' => $careHome->name,
                    ],
                ]);
            }

            // Mark invoice as paid
            $invoice->markAsPaid();
        });

        return back()->with('success', 'Invoice paid successfully. Payments have been transferred to workers.');
    }

    /**
     * Create Stripe checkout session for invoice payment
     */
    public function createStripeCheckout(Invoice $invoice)
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome || $invoice->care_home_id !== $careHome->id) {
            abort(403, 'Access denied');
        }

        if ($invoice->status === 'paid') {
            return back()->with('error', 'This invoice has already been paid');
        }

        try {
            \Stripe\Stripe::setApiKey(config('stripe.secret_key'));

            // Load timesheets with workers to get their Stripe accounts
            $invoice->load(['timesheets.worker']);

            // For simplicity, we'll create one payment session
            // In a real-world scenario with multiple workers, you might need to handle this differently
            // For now, we'll charge the platform and then transfer to workers
            
            // Create checkout session
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'gbp',
                        'product_data' => [
                            'name' => "Invoice {$invoice->invoice_number}",
                            'description' => "Payment for {$invoice->timesheets->count()} timesheet(s)",
                        ],
                        'unit_amount' => (int)($invoice->total * 100), // Convert to cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => route('invoices.stripe-success', ['invoice' => $invoice->id]) . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('invoices.show', ['invoice' => $invoice->id]),
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'care_home_id' => $careHome->id,
                ],
            ]);

            // Store session ID in invoice
            $invoice->update([
                'stripe_session_id' => $session->id,
            ]);

            return redirect($session->url);

        } catch (\Exception $e) {
            \Log::error('Stripe checkout creation failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to create payment session: ' . $e->getMessage());
        }
    }

    /**
     * Handle successful Stripe payment
     */
    public function stripeSuccess(Request $request, Invoice $invoice)
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome || $invoice->care_home_id !== $careHome->id) {
            abort(403, 'Access denied');
        }

        $sessionId = $request->get('session_id');
        if (!$sessionId || $invoice->stripe_session_id !== $sessionId) {
            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'Invalid payment session');
        }

        try {
            \Stripe\Stripe::setApiKey(config('stripe.secret_key'));
            $session = \Stripe\Checkout\Session::retrieve($sessionId);

            if ($session->payment_status === 'paid') {
                DB::transaction(function () use ($invoice, $session, $careHome) {
                    // Set Stripe API key for operations inside transaction
                    \Stripe\Stripe::setApiKey(config('stripe.secret_key'));
                    
                    // Mark invoice as paid first
                    $invoice->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                        'stripe_payment_intent_id' => $session->payment_intent,
                    ]);

                    // Mark all timesheets as paid
                    $invoice->timesheets()->update(['status' => 'paid']);
                    
                    // Log status change for each timesheet
                    foreach ($invoice->timesheets as $timesheet) {
                        $timesheet->logStatusChange('paid', null, "Paid via invoice {$invoice->invoice_number}");
                    }

                    // Get the PaymentIntent to access charge ID
                    $paymentIntent = \Stripe\PaymentIntent::retrieve(
                        $session->payment_intent
                    );
                    
                    \Log::info('PaymentIntent retrieved', [
                        'payment_intent_id' => $paymentIntent->id,
                        'latest_charge' => $paymentIntent->latest_charge,
                        'status' => $paymentIntent->status,
                    ]);
                    
                    // Get charge ID from latest_charge field
                    if (!$paymentIntent->latest_charge) {
                        \Log::error('No charge found in PaymentIntent', [
                            'payment_intent' => $paymentIntent->toArray()
                        ]);
                        throw new \Exception('No charge found in PaymentIntent');
                    }
                    
                    $chargeId = $paymentIntent->latest_charge;

                    // Process transfers to each worker's Stripe account
                    $invoice->load(['timesheets.worker']);
                    $workerPayments = [];
                    
                    foreach ($invoice->timesheets as $timesheet) {
                        $workerId = $timesheet->worker_id;
                        if (!isset($workerPayments[$workerId])) {
                            $workerPayments[$workerId] = [
                                'worker' => $timesheet->worker,
                                'amount' => 0,
                            ];
                        }
                        $workerPayments[$workerId]['amount'] += $timesheet->total_pay;
                    }

                    // Create transfers to connected accounts using the source transaction
                    // This allows transfers even when balance is pending
                    foreach ($workerPayments as $payment) {
                        if ($payment['worker']->stripe_account_id) {
                            try {
                                $transfer = \Stripe\Transfer::create([
                                    'amount' => (int)($payment['amount'] * 100),
                                    'currency' => 'gbp',
                                    'destination' => $payment['worker']->stripe_account_id,
                                    'source_transaction' => $chargeId,
                                    'description' => "Payment for invoice {$invoice->invoice_number}",
                                    'metadata' => [
                                        'invoice_id' => $invoice->id,
                                        'worker_id' => $payment['worker']->id,
                                    ],
                                ]);

                                // Create notification for worker
                                Notification::create([
                                    'user_id' => $payment['worker']->id,
                                    'type' => 'payment_received',
                                    'title' => 'Payment Received',
                                    'message' => "You have received a payment of £" . number_format($payment['amount'], 2) . " from {$careHome->name} for invoice {$invoice->invoice_number}.",
                                    'data' => [
                                        'amount' => $payment['amount'],
                                        'invoice_id' => $invoice->id,
                                        'invoice_number' => $invoice->invoice_number,
                                        'care_home_name' => $careHome->name,
                                        'transfer_id' => $transfer->id,
                                    ],
                                ]);
                                
                                \Log::info('Stripe transfer created successfully', [
                                    'transfer_id' => $transfer->id,
                                    'worker_id' => $payment['worker']->id,
                                    'worker_email' => $payment['worker']->email,
                                    'amount' => $payment['amount'],
                                    'stripe_account_id' => $payment['worker']->stripe_account_id,
                                ]);
                            } catch (\Exception $e) {
                                \Log::error('Stripe transfer failed', [
                                    'worker_id' => $payment['worker']->id,
                                    'amount' => $payment['amount'],
                                    'error' => $e->getMessage(),
                                    'error_type' => get_class($e),
                                ]);
                                
                                // Store failed transfer info in invoice metadata for retry
                                $failedTransfers = json_decode($invoice->metadata ?? '[]', true);
                                $failedTransfers[] = [
                                    'worker_id' => $payment['worker']->id,
                                    'amount' => $payment['amount'],
                                    'error' => $e->getMessage(),
                                    'timestamp' => now()->toIso8601String(),
                                ];
                                $invoice->update(['metadata' => json_encode($failedTransfers)]);
                            }
                        }
                    }
                });

                return redirect()->route('invoices.show', $invoice)
                    ->with('success', 'Payment successful! Funds are being transferred to workers.');
            }

            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'Payment not completed');

        } catch (\Exception $e) {
            \Log::error('Stripe payment verification failed', [
                'invoice_id' => $invoice->id,
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'Failed to verify payment: ' . $e->getMessage());
        }
    }
}
