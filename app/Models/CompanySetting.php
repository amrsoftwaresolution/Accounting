<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name', 'company_email', 'phone', 'address', 'website', 'industry', 'logo_path',
        'legal_name', 'tax_id', 'business_type', 'legal_address',
        'home_currency', 'multicurrency',
        'work_week_start', 'show_service_field', 'allow_billable_time', 'show_billing_rate',
        'show_tags', 'bill_payment_terms',
    ];

    protected $casts = [
        'multicurrency' => 'boolean',
        'show_service_field' => 'boolean',
        'allow_billable_time' => 'boolean',
        'show_billing_rate' => 'boolean',
        'show_tags' => 'boolean',
    ];
}
