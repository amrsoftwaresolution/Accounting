<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transfer extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'from_account_id', 'to_account_id',
        'from_currency_id', 'from_exchange_rate',
        'to_currency_id', 'to_exchange_rate',
        'amount', 'date', 'memo', 'reference_no'
    ];
}
