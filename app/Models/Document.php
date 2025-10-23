<?php

namespace App\Models;

use App\DocumentVerificationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'care_home_id',
        'user_id',
        'document_type',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'rejection_reason',
        'action_required',
        'reviewed_by',
        'reviewed_at',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'status' => DocumentVerificationStatus::class,
    ];

    protected $appends = [
        'file_url',
    ];

    public function getFileUrlAttribute()
    {
        return url($this->file_path);
    }

    public function careHome(): BelongsTo
    {
        return $this->belongsTo(CareHome::class);
    }

    public function healthWorker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isActionRequired(): bool
    {
        return $this->status->isActionRequired();
    }

    public function getStatusDisplayName(): string
    {
        return $this->status->getDisplayName();
    }

    public function getStatusColor(): string
    {
        return $this->status->getColor();
    }

    public function getStatusIcon(): string
    {
        return $this->status->getIcon();
    }
}
