<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'low_stock_to_emails',
        'low_stock_cc_emails',
        'low_stock_bcc_emails',
    ];

    protected $casts = [
    ];
}
