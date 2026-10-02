<?php

namespace App\Console\Commands;

use App\Models\InvoiceTransfer;
use App\Models\User;
use App\Services\InvoicePaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PayHeldTransfers extends Command
{
    protected $signature = 'stripe:pay-held-transfers';

    protected $description = 'Try again to pay workers whose Stripe transfers were held or failed';

    public function handle(InvoicePaymentService $paymentService): int
    {
        $workerIds = InvoiceTransfer::owed()->distinct()->pluck('worker_id');
        $paid = 0;

        foreach (User::whereIn('id', $workerIds)->get() as $worker) {
            try {
                $paid += $paymentService->payOwedTransfers($worker);
            } catch (\Exception $e) {
                Log::error('Failed to retry held transfers for worker', [
                    'worker_id' => $worker->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Paid {$paid} held transfer(s). " . InvoiceTransfer::owed()->count() . ' still owed.');

        return self::SUCCESS;
    }
}
