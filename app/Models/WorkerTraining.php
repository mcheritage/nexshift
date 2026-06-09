<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkerTraining extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'uuid';

    protected $fillable = [
        'user_id',
        'training_type_id',
        'certificate_path',
        'certificate_original_name',
        'completed_at',
        'expires_at',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'notes',
    ];

    protected $casts = [
        'completed_at' => 'date',
        'expires_at' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trainingType(): BelongsTo
    {
        return $this->belongsTo(TrainingType::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getCertificateUrlAttribute(): ?string
    {
        return $this->certificate_path ? url($this->certificate_path) : null;
    }

    public function getComplianceStatusAttribute(): string
    {
        if ($this->status !== 'approved') {
            return $this->status;
        }
        if ($this->expires_at->isPast()) {
            return 'expired';
        }
        if ($this->expires_at->diffInDays(now()) <= 30) {
            return 'expiring_soon';
        }
        return 'valid';
    }

    protected $appends = ['certificate_url', 'compliance_status'];
}
