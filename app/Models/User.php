<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string first_name
 * @property string last_name
 * @property string other_names
 * @property string gender
 * @property string care_home_id
 * @property string email
 * @property string password
 * @property string id
 * @property CareHome $care_home
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids;

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
        ];
    }

    public function care_home()
    {
        return $this->belongsTo(CareHome::class);
    }

    public function getNameAttribute(): string {
        if($care_home = $this->care_home) {
            return $care_home->name;
        }
        return "{$this->first_name} {$this->last_name}";
    }
}
