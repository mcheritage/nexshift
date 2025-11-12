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
    ];

    public function users()
    {
        return $this->hasMany(User::class);
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
}
