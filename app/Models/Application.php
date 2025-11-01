<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Application Model
 * 
 * Represents a healthcare worker's application to work a specific shift
 * 
 * @property string $id
 * @property string $shift_id
 * @property string $worker_id
 * @property string $status
 * @property string|null $message
 * @property \Carbon\Carbon $applied_at
 * @property \Carbon\Carbon|null $reviewed_at
 * @property string|null $reviewed_by
 * @property string|null $rejection_reason
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * 
 * @property Shift $shift
 * @property User $worker
 * @property User|null $reviewer
 */
class Application extends Model
{
    use HasUuids;

    protected $fillable = [
        'shift_id',
        'worker_id',
        'status',
        'message',
        'worker_skills',
        'applied_at',
        'reviewed_at',
        'reviewed_by',
        'review_notes',
        'rejection_reason',
        'withdrawn_at',
        'withdrawal_reason',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'withdrawn_at' => 'datetime',
        'worker_skills' => 'array',
    ];

    protected $appends = [
        'status_display',
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_WITHDRAWN = 'withdrawn';

    /**
     * Get all possible status values
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING => 'Pending Review',
            self::STATUS_ACCEPTED => 'Accepted',
            self::STATUS_REJECTED => 'Rejected',
            self::STATUS_WITHDRAWN => 'Withdrawn',
        ];
    }

    /**
     * Relationship: Application belongs to a shift
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    /**
     * Relationship: Application belongs to a worker (user)
     */
    public function worker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    /**
     * Relationship: Application belongs to a user (alias for worker)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    /**
     * Relationship: Application reviewed by user
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope: Pending applications
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Accepted applications
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }

    /**
     * Check if application is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if application is accepted
     */
    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    /**
     * Check if application is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Get the display name for the status
     */
    public function getStatusDisplayAttribute(): string
    {
        return self::getStatuses()[$this->status] ?? 'Unknown';
    }
}
