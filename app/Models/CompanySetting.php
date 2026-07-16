<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_id',
        'show_tags', 'bill_payment_terms',
    ];

    protected $casts = [
        'multicurrency' => 'boolean',
        'show_tags' => 'boolean',
    ];
}
