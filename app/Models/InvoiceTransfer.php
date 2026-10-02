<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceTransfer extends Model
{
    use HasUuids;

    protected $keyType = 'uuid';

    protected $fillable = [
        'invoice_id',
        'worker_id',
        'amount',
        'status',
        'reason',
        'stripe_transfer_id',
        'attempts',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'attempts' => 'integer',
        'paid_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_PAID = 'paid';
    public const STATUS_HELD = 'held';     // Worker's Stripe account is not ready
    public const STATUS_FAILED = 'failed'; // Stripe refused the transfer

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    /**
     * Transfers the worker is still owed
     */
    public function scopeOwed($query)
    {
        return $query->whereIn('status', [self::STATUS_HELD, self::STATUS_FAILED]);
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }
}
