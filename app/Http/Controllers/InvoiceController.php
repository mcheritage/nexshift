<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Timesheet;
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
            'total_outstanding' => Invoice::where('care_home_id', $careHome->id)
                ->whereIn('status', ['sent', 'overdue'])
                ->sum('total'),
            'total_paid' => Invoice::where('care_home_id', $careHome->id)
                ->where('status', 'paid')
                ->sum('total'),
        ];

        \Log::info('Invoice Index Data', [
            'invoices_count' => $invoices->total(),
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);

        return Inertia::render('Invoices/Index', [
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
     * Store a newly created invoice
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
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string',
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

            // Calculate totals
            $subtotal = $timesheets->sum('total_pay');
            $taxAmount = ($subtotal * $validated['tax_rate']) / 100;
            $total = $subtotal + $taxAmount;

            // Create invoice
            $invoice = Invoice::create([
                'care_home_id' => $careHome->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'invoice_date' => $validated['invoice_date'],
                'period_start' => $validated['period_start'],
                'period_end' => $validated['period_end'],
                'subtotal' => $subtotal,
                'tax_rate' => $validated['tax_rate'],
                'tax_amount' => $taxAmount,
                'total' => $total,
                'status' => 'draft',
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'] ?? null,
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

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
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

        $invoice->markAsPaid();

        return back()->with('success', 'Invoice marked as paid');
    }
}
