<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ChartOfAcc extends Model
{
    use HasUuids;

    protected $fillable = [
        'account_code',
        'name',
        'account_type',
        'sub_type',
        'balance',
    ];
}
