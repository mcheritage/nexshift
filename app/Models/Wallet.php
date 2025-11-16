<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Wallet extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_type',
        'owner_id',
        'balance',
        'total_credited',
        'total_debited',
        'currency',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'total_credited' => 'decimal:2',
        'total_debited' => 'decimal:2',
    ];

    /**
     * Get the owner of the wallet (User or CareHome)
     */
    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get all transactions for this wallet
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class)->orderBy('created_at', 'desc');
    }

    /**
     * Credit the wallet (add money)
     */
    public function credit(
        float $amount,
        string $category,
        string $description,
        ?string $reason = null,
        ?string $proofFilePath = null,
        ?User $performedBy = null,
        ?array $metadata = null
    ): Transaction {
        return DB::transaction(function () use ($amount, $category, $description, $reason, $proofFilePath, $performedBy, $metadata) {
            $balanceBefore = $this->balance;
            $balanceAfter = $balanceBefore + $amount;

            // Update wallet
            $this->update([
                'balance' => $balanceAfter,
                'total_credited' => $this->total_credited + $amount,
            ]);

            // Create transaction record
            return $this->transactions()->create([
                'transaction_id' => \Illuminate\Support\Str::uuid(),
                'type' => 'credit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'category' => $category,
                'description' => $description,
                'reason' => $reason,
                'proof_file_path' => $proofFilePath,
                'performed_by_id' => $performedBy?->id,
                'performed_by_type' => $performedBy ? get_class($performedBy) : null,
                'status' => 'completed',
                'completed_at' => now(),
                'metadata' => $metadata ? json_encode($metadata) : null,
            ]);
        });
    }

    /**
     * Debit the wallet (remove money)
     */
    public function debit(
        float $amount,
        string $category,
        string $description,
        ?string $reason = null,
        ?string $proofFilePath = null,
        ?User $performedBy = null,
        ?array $metadata = null
    ): Transaction {
        if ($this->balance < $amount) {
            throw new \Exception('Insufficient balance');
        }

        return DB::transaction(function () use ($amount, $category, $description, $reason, $proofFilePath, $performedBy, $metadata) {
            $balanceBefore = $this->balance;
            $balanceAfter = $balanceBefore - $amount;

            // Update wallet
            $this->update([
                'balance' => $balanceAfter,
                'total_debited' => $this->total_debited + $amount,
            ]);

            // Create transaction record
            return $this->transactions()->create([
                'transaction_id' => \Illuminate\Support\Str::uuid(),
                'type' => 'debit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'category' => $category,
                'description' => $description,
                'reason' => $reason,
                'proof_file_path' => $proofFilePath,
                'performed_by_id' => $performedBy?->id,
                'performed_by_type' => $performedBy ? get_class($performedBy) : null,
                'status' => 'completed',
                'completed_at' => now(),
                'metadata' => $metadata ? json_encode($metadata) : null,
            ]);
        });
    }

    /**
     * Check if wallet has sufficient balance
     */
    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
     * Get formatted balance
     */
    public function getFormattedBalanceAttribute(): string
    {
        return '£' . number_format($this->balance, 2);
    }

    /**
     * Get or create wallet for an owner
     */
    public static function getOrCreateFor($owner): self
    {
        return static::firstOrCreate([
            'owner_type' => get_class($owner),
            'owner_id' => $owner->id,
        ], [
            'balance' => 0,
            'total_credited' => 0,
            'total_debited' => 0,
            'currency' => 'GBP',
        ]);
    }
}
