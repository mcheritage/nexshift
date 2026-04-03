<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
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
 * @property string|null stripe_account_id
 * @property CareHome $care_home
 */
class User extends Authenticatable implements MustVerifyEmail
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
        'date_of_birth',
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
        'stripe_account_id',
        'stripe_onboarding_complete',
        'stripe_account_type',
        'stripe_connected_at',
        'stripe_charges_enabled',
        'stripe_payouts_enabled',
        'stripe_requirements',
        'notification_preferences',
        'onesignal_player_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
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
            'stripe_onboarding_complete' => 'boolean',
            'stripe_connected_at' => 'datetime',
            'stripe_charges_enabled' => 'boolean',
            'stripe_payouts_enabled' => 'boolean',
            'stripe_requirements' => 'array',
            'notification_preferences' => 'array',
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

    /**
     * Get the user's wallet
     */
    public function wallet()
    {
        return $this->morphOne(Wallet::class, 'owner');
    }

    /**
     * Get or create wallet for this user
     */
    public function getWallet(): Wallet
    {
        return Wallet::getOrCreateFor($this);
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

    /**
     * Check if user has a Stripe account connected
     */
    public function hasStripeAccount(): bool
    {
        return !empty($this->stripe_account_id);
    }

    /**
     * Check if user has completed Stripe onboarding
     */
    public function hasCompletedStripeOnboarding(): bool
    {
        return $this->stripe_onboarding_complete === true;
    }

    /**
     * Check if user can receive payments via Stripe
     */
    public function canReceivePayments(): bool
    {
        return $this->hasStripeAccount() 
            && $this->hasCompletedStripeOnboarding()
            && $this->stripe_charges_enabled
            && $this->stripe_payouts_enabled;
    }

    /**
     * Get Stripe connection status
     */
    public function getStripeStatus(): string
    {
        if (!$this->hasStripeAccount()) {
            return 'not_connected';
        }

        if (!$this->hasCompletedStripeOnboarding()) {
            return 'pending_onboarding';
        }

        if (!$this->canReceivePayments()) {
            return 'incomplete_setup';
        }

        return 'active';
    }
    public function isActive(): bool
    {
        return $this->status === 'approved';
    }
}
