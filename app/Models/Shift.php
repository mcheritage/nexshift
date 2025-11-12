<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $care_home_id
 * @property string $title
 * @property string $description
 * @property string $role
 * @property string $shift_date
 * @property string $start_time
 * @property string $end_time
 * @property float $duration_hours
 * @property float $hourly_rate
 * @property float $total_pay
 * @property array $required_skills
 * @property array $required_qualifications
 * @property string $special_requirements
 * @property string $status
 * @property int $max_applicants
 * @property bool $is_urgent
 * @property bool $is_recurring
 * @property string $recurrence_pattern
 * @property string $selected_worker_id
 * @property string $application_deadline
 * @property string $published_at
 * @property string $filled_at
 * @property string $completed_at
 * @property string $created_by
 * @property CareHome $careHome
 * @property User $selectedWorker
 * @property User $createdBy
 */
class Shift extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'uuid';
    
    protected $fillable = [
        'care_home_id',
        'title',
        'description',
        'role',
        'location',
        'start_datetime',
        'end_datetime',
        'duration_hours',
        'hourly_rate',
        'total_pay',
        'required_skills',
        'required_qualifications',
        'special_requirements',
        'status',
        'max_applicants',
        'is_urgent',
        'is_recurring',
        'recurrence_pattern',
        'selected_worker_id',
        'application_deadline',
        'published_at',
        'filled_at',
        'completed_at',
        'created_by',
        'cancellation_reason',
        'cancelled_by',
        'cancelled_at',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'duration_hours' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'total_pay' => 'decimal:2',
        'required_skills' => 'array',
        'required_qualifications' => 'array',
        'is_urgent' => 'boolean',
        'is_recurring' => 'boolean',
        'application_deadline' => 'datetime',
        'published_at' => 'datetime',
        'filled_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    protected $appends = [
        'start_date_time',
        'end_date_time',
        'start_time',
        'end_time',
        'shift_date',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically calculate total_pay when creating or updating
        static::saving(function ($shift) {
            if ($shift->duration_hours && $shift->hourly_rate) {
                $shift->total_pay = $shift->duration_hours * $shift->hourly_rate;
            }
        });
    }

    // Role constants
    public const ROLE_REGISTERED_NURSE = 'registered_nurse';
    public const ROLE_HEALTHCARE_ASSISTANT = 'healthcare_assistant';
    public const ROLE_SUPPORT_WORKER = 'support_worker';
    public const ROLE_SENIOR_CARE_WORKER = 'senior_care_worker';
    public const ROLE_NIGHT_SHIFT_WORKER = 'night_shift_worker';
    public const ROLE_BANK_STAFF = 'bank_staff';

    // Status constants
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_FILLED = 'filled';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Get all available roles
     */
    public static function getRoles(): array
    {
        return [
            self::ROLE_REGISTERED_NURSE => 'Registered Nurse (RN)',
            self::ROLE_HEALTHCARE_ASSISTANT => 'Healthcare Assistant (HCA)',
            self::ROLE_SUPPORT_WORKER => 'Support Worker',
            self::ROLE_SENIOR_CARE_WORKER => 'Senior Care Worker',
            self::ROLE_NIGHT_SHIFT_WORKER => 'Night Shift Worker',
            self::ROLE_BANK_STAFF => 'Bank Staff',
        ];
    }

    /**
     * Get role labels (alias for getRoles for backward compatibility)
     */
    public static function getRoleLabels(): array
    {
        return self::getRoles();
    }

    /**
     * Get all available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PUBLISHED => 'Published',
            self::STATUS_FILLED => 'Filled',
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
    }

    /**
     * Relationship: Shift belongs to Care Home
     */
    public function careHome(): BelongsTo
    {
        return $this->belongsTo(CareHome::class);
    }

    /**
     * Relationship: Shift belongs to selected worker
     */
    public function selectedWorker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'selected_worker_id');
    }

    /**
     * Relationship: Shift was created by user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Shift was cancelled by user
     */
    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Relationship: Shift has many applications
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Relationship: Shift has many timesheets
     */
    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class);
    }

    /**
     * Calculate duration in hours based on start and end datetime
     */
    public function calculateDuration(): float
    {
        if (!$this->start_datetime || !$this->end_datetime) {
            return 0;
        }
        
        return $this->end_datetime->diffInHours($this->start_datetime, true);
    }

    /**
     * Calculate total pay
     */
    public function calculateTotalPay(): float
    {
        return $this->duration_hours * $this->hourly_rate;
    }

    /**
     * Scope: Published shifts only
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED)
                    ->where('published_at', '<=', now());
    }

    /**
     * Scope: Available shifts (published and not filled)
     */
    public function scopeAvailable($query)
    {
        return $query->published()
                    ->whereIn('status', [self::STATUS_PUBLISHED]);
    }

    /**
     * Check if shift is available for applications
     */
    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_PUBLISHED && 
               ($this->application_deadline === null || now()->lessThan($this->application_deadline));
    }

    /**
     * Check if shift can accept new applications (not filled)
     */
    public function canAcceptApplications(): bool
    {
        return $this->isAvailable() && $this->status !== self::STATUS_FILLED;
    }

    /**
     * Check if this shift is urgent (within 24 hours)
     */
    public function isUrgent(): bool
    {
        if ($this->is_urgent) {
            return true;
        }
        
        return now()->diffInHours($this->start_datetime) <= 24;
    }

    /**
     * Get the role display name
     */
    public function getRoleDisplayAttribute(): string
    {
        return self::getRoles()[$this->role] ?? $this->role;
    }

    /**
     * Get the status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return self::getStatuses()[$this->status] ?? $this->status;
    }

    /**
     * Get backward compatible shift_date attribute (just date portion from start_datetime)
     */
    public function getShiftDateAttribute(): string
    {
        $startDatetime = $this->getRawOriginal('start_datetime');
        if (!$startDatetime) {
            return '';
        }
        
        return \Carbon\Carbon::parse($startDatetime)->format('Y-m-d');
    }

    /**
     * Get backward compatible start_time attribute (just time portion)
     */
    public function getStartTimeAttribute(): string
    {
        $startDatetime = $this->getRawOriginal('start_datetime');
        if (!$startDatetime) {
            return '';
        }
        
        return \Carbon\Carbon::parse($startDatetime)->format('H:i');
    }

    /**
     * Get backward compatible end_time attribute (just time portion)
     */
    public function getEndTimeAttribute(): string
    {
        $endDatetime = $this->getRawOriginal('end_datetime');
        if (!$endDatetime) {
            return '';
        }
        
        return \Carbon\Carbon::parse($endDatetime)->format('H:i');
    }

    /**
     * Get the combined start date and time for backward compatibility
     */
    public function getStartDateTimeAttribute(): string
    {
        $startDatetime = $this->getRawOriginal('start_datetime');
        if (!$startDatetime) {
            return '';
        }
        
        return \Carbon\Carbon::parse($startDatetime)->format('Y-m-d\TH:i:s');
    }

    /**
     * Get the combined end date and time for backward compatibility
     */
    public function getEndDateTimeAttribute(): string
    {
        $endDatetime = $this->getRawOriginal('end_datetime');
        if (!$endDatetime) {
            return '';
        }
        
        return \Carbon\Carbon::parse($endDatetime)->format('Y-m-d\TH:i:s');
    }
}
