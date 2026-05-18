<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'billing_period',
        'max_companies',
        'max_chart_of_accounts',
        'max_products',
        'max_users',
        'max_invoices_per_month',
        'is_active',
    ];
}
