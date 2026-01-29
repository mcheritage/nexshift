<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Invoice extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'uuid';

    protected $fillable = [
        'care_home_id',
        'invoice_number',
        'invoice_date',
        'period_start',
        'period_end',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total',
        'status',
        'stripe_session_id',
        'stripe_payment_intent_id',
        'payment_metadata',
        'due_date',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'due_date' => 'date',
        'paid_at' => 'date',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Status constants
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SENT = 'sent';
    public const STATUS_PAID = 'paid';
    public const STATUS_OVERDUE = 'overdue';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the care home that owns the invoice
     */
    public function careHome(): BelongsTo
    {
        return $this->belongsTo(CareHome::class);
    }

    /**
     * Get the timesheets associated with this invoice
     */
    public function timesheets(): BelongsToMany
    {
        return $this->belongsToMany(Timesheet::class, 'invoice_timesheet')
            ->withTimestamps();
    }

    /**
     * Generate a unique invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $lastInvoice = static::whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastInvoice && preg_match('/INV-' . $year . '-(\d+)/', $lastInvoice->invoice_number, $matches)) {
            $number = intval($matches[1]) + 1;
        } else {
            $number = 1;
        }

        return sprintf('INV-%d-%03d', $year, $number);
    }

    /**
     * Check if invoice is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_SENT 
            && $this->due_date 
            && $this->due_date->isPast();
    }

    /**
     * Mark invoice as paid
     */
    public function markAsPaid(): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_at' => now(),
        ]);
    }
}
