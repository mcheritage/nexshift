<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HealthcareProfile extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'uuid';

    protected $fillable = [
        'user_id',
        'is_profile_complete',
    ];

    protected $casts = [
        'is_profile_complete' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workExperiences(): HasMany
    {
        return $this->hasMany(WorkExperience::class, 'user_id', 'user_id');
    }

    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class, 'user_id', 'user_id');
    }

    public function bankDetails(): BelongsTo
    {
        return $this->belongsTo(BankDetails::class, 'user_id', 'user_id');
    }
}