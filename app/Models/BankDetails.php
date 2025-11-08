<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankDetails extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'uuid';

    protected $fillable = [
        'user_id',
        'account_holder_name',
        'sort_code',
        'account_number',
        'bank_name',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}