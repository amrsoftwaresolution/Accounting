<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'low_stock_to_emails',
        'low_stock_cc_emails',
        'low_stock_bcc_emails',
        'acct_method', 
        'fin_year_start',
        'tax_year_start',
        'close_books',
        'tax_form',
        'warn_dup_cheque',
        'warn_dup_bill',
        'warn_dup_journal',
        'sign_out_inactive',
    ];

    protected $casts = [
    ];
}
