<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_id',
        'wallet_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'category',
        'description',
        'reason',
        'proof_file_path',
        'related_model_type',
        'related_model_id',
        'performed_by_id',
        'performed_by_type',
        'invoice_id',
        'timesheet_id',
        'status',
        'completed_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Transaction categories
    public const CATEGORY_MANUAL_CREDIT = 'manual_credit';
    public const CATEGORY_MANUAL_DEBIT = 'manual_debit';
    public const CATEGORY_INVOICE_PAYMENT = 'invoice_payment';
    public const CATEGORY_TIMESHEET_PAYMENT = 'timesheet_payment';
    public const CATEGORY_REFUND = 'refund';
    public const CATEGORY_ADJUSTMENT = 'adjustment';
    public const CATEGORY_WITHDRAWAL = 'withdrawal';

    /**
     * Get the wallet that owns the transaction
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Get the user who performed the transaction
     */
    public function performedBy(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the related model (Invoice, Timesheet, etc)
     */
    public function relatedModel(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the invoice if this is an invoice payment
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the timesheet if this is a timesheet payment
     */
    public function timesheet(): BelongsTo
    {
        return $this->belongsTo(Timesheet::class);
    }

    /**
     * Scope to get credit transactions
     */
    public function scopeCredits($query)
    {
        return $query->where('type', 'credit');
    }

    /**
     * Scope to get debit transactions
     */
    public function scopeDebits($query)
    {
        return $query->where('type', 'debit');
    }

    /**
     * Scope to get completed transactions
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Get formatted amount with currency
     */
    public function getFormattedAmountAttribute(): string
    {
        return '£' . number_format($this->amount, 2);
    }

    /**
     * Check if transaction is a credit
     */
    public function isCredit(): bool
    {
        return $this->type === 'credit';
    }

    /**
     * Check if transaction is a debit
     */
    public function isDebit(): bool
    {
        return $this->type === 'debit';
    }

    /**
     * Get display name for category
     */
    public function getCategoryDisplayName(): string
    {
        return match($this->category) {
            self::CATEGORY_MANUAL_CREDIT => 'Manual Credit',
            self::CATEGORY_MANUAL_DEBIT => 'Manual Debit',
            self::CATEGORY_INVOICE_PAYMENT => 'Invoice Payment',
            self::CATEGORY_TIMESHEET_PAYMENT => 'Timesheet Payment',
            self::CATEGORY_REFUND => 'Refund',
            self::CATEGORY_ADJUSTMENT => 'Adjustment',
            self::CATEGORY_WITHDRAWAL => 'Withdrawal',
            default => ucfirst(str_replace('_', ' ', $this->category)),
        };
    }
}
