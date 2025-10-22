<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Timesheet extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'uuid';

    protected $fillable = [
        'shift_id',
        'worker_id', 
        'care_home_id',
        'clock_in_time',
        'clock_out_time',
        'break_duration_minutes',
        'total_hours',
        'hourly_rate',
        'total_pay',
        'status',
        'worker_notes',
        'manager_notes',
        'approved_by',
        'approved_at',
        'submitted_at',
        'has_overtime',
        'overtime_hours',
        'overtime_rate'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'submitted_at' => 'datetime',
        'has_overtime' => 'boolean',
        'total_hours' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'total_pay' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'overtime_rate' => 'decimal:2'
    ];

    // Status constants
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_QUERIED = 'queried';
    public const STATUS_REJECTED = 'rejected';

    // Relationships
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function careHome(): BelongsTo
    {
        return $this->belongsTo(CareHome::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Accessors to return just the time part for API responses
    public function getClockInTimeAttribute($value)
    {
        if (!$value) return null;
        return Carbon::parse($value)->format('H:i');
    }
    
    public function getClockOutTimeAttribute($value)
    {
        if (!$value) return null;
        return Carbon::parse($value)->format('H:i');
    }

    // Helper methods - use raw attributes to avoid accessor interference
    public function calculateTotalHours(): float
    {
        if (!$this->getRawOriginal('clock_in_time') || !$this->getRawOriginal('clock_out_time')) {
            return 0;
        }

        $clockIn = Carbon::parse($this->getRawOriginal('clock_in_time'));
        $clockOut = Carbon::parse($this->getRawOriginal('clock_out_time'));
        
        $totalMinutes = $clockOut->diffInMinutes($clockIn);
        $workingMinutes = $totalMinutes - $this->break_duration_minutes;
        
        return round($workingMinutes / 60, 2);
    }

    public function calculateTotalPay(): float
    {
        $regularPay = $this->total_hours * $this->hourly_rate;
        $overtimePay = $this->has_overtime ? 
            ($this->overtime_hours * ($this->overtime_rate ?? $this->hourly_rate * 1.5)) : 0;
        
        return round($regularPay + $overtimePay, 2);
    }

    public function canBeApproved(): bool
    {
        return $this->status === self::STATUS_SUBMITTED;
    }

    public function canBeQueried(): bool
    {
        return in_array($this->status, [self::STATUS_SUBMITTED, self::STATUS_QUERIED]);
    }

    public function canBeRejected(): bool
    {
        return $this->status === self::STATUS_SUBMITTED;
    }

    public function isEditable(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_QUERIED]);
    }

    // Scopes
    public function scopePendingApproval($query)
    {
        return $query->where('status', self::STATUS_SUBMITTED);
    }

    public function scopeForCareHome($query, $careHomeId)
    {
        return $query->where('care_home_id', $careHomeId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('clock_in_time', [$startDate, $endDate]);
    }

    // Get status options
    public static function getStatuses(): array
    {
        return [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_SUBMITTED => 'Submitted',
            self::STATUS_APPROVED => 'Approved', 
            self::STATUS_QUERIED => 'Queried',
            self::STATUS_REJECTED => 'Rejected'
        ];
    }

    // Auto-calculate on save
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($timesheet) {
            // Only auto-calculate if the values are not already set (for backward compatibility)
            // If total_hours and total_pay are already set (from frontend), don't recalculate
            if ($timesheet->clock_in_time && $timesheet->clock_out_time) {
                // Only calculate if total_hours is not already set (null) 
                // Don't recalculate if it's 0 - frontend might have sent 0 as a valid value
                if (is_null($timesheet->total_hours)) {
                    $timesheet->total_hours = $timesheet->calculateTotalHours();
                }
                
                // Only calculate if total_pay is not already set (null)
                // Don't recalculate if it's 0 - frontend might have sent 0 as a valid value
                if (is_null($timesheet->total_pay)) {
                    $timesheet->total_pay = $timesheet->calculateTotalPay();
                }
            }
        });
    }
}
