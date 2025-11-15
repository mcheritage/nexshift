<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\UserRoles;
use App\Utils\Constants;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property string first_name
 * @property string last_name
 * @property string other_names
 * @property string gender
 * @property string care_home_id
 * @property string email
 * @property string password
 * @property string id
 * @property string profile_photo
 * @property string phone_number
 * @property string bio
 * @property CareHome $care_home
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids, HasApiTokens;

    protected $keyType = 'uuid';


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'other_names',
        'gender',
        'care_home_id',
        'email',
        'password',
        'role',
        'phone_number',
        'bio',
        'qualifications',
        'certifications',
        'years_experience',
        'skills',
        'profile_photo',
        'hourly_rate_min',
        'hourly_rate_max',
        'available_weekends',
        'available_nights',
        'additional_notes',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'qualifications' => 'array',
            'certifications' => 'array',
            'skills' => 'array',
            'available_weekends' => 'boolean',
            'available_nights' => 'boolean',
            'is_admin' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    public function care_home()
    {
        return $this->belongsTo(CareHome::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->where('read', false);
    }

    public function applications()
    {
        return $this->hasMany(\App\Models\Application::class, 'worker_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    // Healthcare Profile relationships
    public function healthcareProfile()
    {
        return $this->hasOne(HealthcareProfile::class);
    }

    public function workExperiences()
    {
        return $this->hasMany(WorkExperience::class);
    }

    public function skills()
    {
        return $this->hasMany(Skill::class);
    }

    public function bankDetails()
    {
        return $this->hasOne(BankDetails::class);
    }

    public function getNameAttribute(): string {
        if($care_home = $this->care_home) {
            return $care_home->name;
        }
        return "{$this->first_name} {$this->last_name}";
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function isCareHomeAdmin(): bool
    {
        return $this->role === UserRoles::CARE_HOME_ADMIN->value;
    }

    public function isHealthCareWorker(): bool
    {
        return $this->role === UserRoles::HEALTH_WORKER->value;
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get all status changes for this user (healthcare worker)
     */
    public function statusChanges()
    {
        return $this->morphMany(StatusChange::class, 'model')->orderBy('created_at', 'desc');
    }

    /**
     * Check if the user is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the user is pending approval
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the user is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if the user is suspended
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if the user is active (approved and not suspended)
     */
    public function isActive(): bool
    {
        return $this->status === 'approved';
    }
}
