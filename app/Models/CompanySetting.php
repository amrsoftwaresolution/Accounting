<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name', 'company_email', 'phone', 'address', 'website', 'industry', 'logo_path',
        'legal_name', 'tax_id', 'business_type', 'legal_address',
        'home_currency', 'multicurrency'
    ];

    protected $casts = [
        'multicurrency' => 'boolean',
    ];
}
