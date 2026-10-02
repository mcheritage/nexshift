<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvoiceTransfer;
use App\Services\InvoicePaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class HeldPaymentController extends Controller
{
    /**
     * Worker payments that have been collected from care homes but not yet sent
     */
    public function index(): Response
    {
        $transfers = InvoiceTransfer::owed()
            ->with([
                'worker:id,first_name,last_name,email,stripe_account_id',
                'invoice:id,invoice_number,care_home_id,paid_at',
                'invoice.careHome:id,name',
            ])
            ->orderBy('created_at')
            ->limit(1000)
            ->get();

        return Inertia::render('admin/held-payments/index', [
            'transfers' => $transfers,
            'stats' => [
                'count' => InvoiceTransfer::owed()->count(),
                'total' => (float) InvoiceTransfer::owed()->sum('amount'),
                'workers' => InvoiceTransfer::owed()->distinct()->count('worker_id'),
            ],
            'message' => session('success') ? ['type' => 'success', 'text' => session('success')]
                : (session('error') ? ['type' => 'error', 'text' => session('error')] : null),
        ]);
    }

    /**
     * Try again to send a held or failed payment
     */
    public function retry(InvoiceTransfer $invoiceTransfer, InvoicePaymentService $paymentService): RedirectResponse
    {
        try {
            $transfer = $paymentService->retryTransfer($invoiceTransfer);
        } catch (\Exception $e) {
            Log::error('Admin retry of held transfer failed', [
                'invoice_transfer_id' => $invoiceTransfer->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('admin.held-payments.index')
                ->with('error', 'Could not retry the payment: ' . $e->getMessage());
        }

        if ($transfer->isPaid()) {
            return redirect()->route('admin.held-payments.index')
                ->with('success', 'Payment of £' . number_format((float) $transfer->amount, 2) . ' sent to the worker.');
        }

        return redirect()->route('admin.held-payments.index')
            ->with('error', 'Payment still not sent: ' . $transfer->reason);
    }
}
