<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChartOfAcc extends Model
{
    protected $fillable = [
        'team_id',
        'account_code',
        'account_name',
        'account_type',
        'account_sub_type',
        'description',
        'is_active',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
