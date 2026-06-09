<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Invoice::with(['careHome:id,name'])
            ->withCount('timesheets')
            ->orderBy('invoice_date', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('careHome', function ($ch) use ($search) {
                      $ch->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('care_home_id')) {
            $query->where('care_home_id', $request->care_home_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('invoice_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('invoice_date', '<=', $request->date_to);
        }

        $invoices = $query->limit(1000)->get();

        $stats = [
            'total'            => Invoice::count(),
            'draft'            => Invoice::where('status', Invoice::STATUS_DRAFT)->count(),
            'sent'             => Invoice::where('status', Invoice::STATUS_SENT)->count(),
            'paid'             => Invoice::where('status', Invoice::STATUS_PAID)->count(),
            'overdue'          => Invoice::where('status', Invoice::STATUS_OVERDUE)->count(),
            'total_outstanding' => Invoice::whereIn('status', [Invoice::STATUS_SENT, Invoice::STATUS_OVERDUE])->sum('total'),
            'total_paid'       => Invoice::where('status', Invoice::STATUS_PAID)->sum('total'),
        ];

        $careHomes = CareHome::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/invoices/index', [
            'invoices'  => $invoices,
            'stats'     => $stats,
            'careHomes' => $careHomes,
            'filters'   => $request->only(['search', 'status', 'care_home_id', 'date_from', 'date_to']),
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load([
            'careHome:id,name,address,postcode,phone_number',
            'timesheets.worker:id,first_name,last_name,email',
            'timesheets.shift:id,title,role',
        ]);

        return Inertia::render('admin/invoices/show', [
            'invoice' => $invoice,
        ]);
    }
}
