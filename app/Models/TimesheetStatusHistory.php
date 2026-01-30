<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimesheetStatusHistory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'timesheet_status_history';
    protected $keyType = 'uuid';

    protected $fillable = [
        'timesheet_id',
        'changed_by',
        'status',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function timesheet(): BelongsTo
    {
        return $this->belongsTo(Timesheet::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
