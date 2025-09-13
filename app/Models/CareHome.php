<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;


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

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
