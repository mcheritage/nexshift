<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


/**
 * @property string id
 * @property string name
 */
class CareHome extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the primary administrator (first user) of the care home
     */
    public function user()
    {
        return $this->hasOne(User::class)->oldestOfMany();
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    public function admin_user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'care_home_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if the care home is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the care home is pending approval
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the care home is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if the care home is suspended
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if the care home is active (approved and not suspended)
     */
    public function isActive(): bool
    {
        return $this->status === 'approved';
    }
}
