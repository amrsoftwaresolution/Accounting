<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvancedSettings extends Model
{
    protected $fillable = [
    'acct_method', 'fin_year_start', 'tax_year_start', 'close_books',
    'tax_form', 'enable_acct_nums', 'discount_acct', 'auto_prefill',
    'auto_invoice_groups', 'auto_apply_bills', 'language', 'date_format',
    'currency_format', 'warn_dup_cheque', 'warn_dup_bill',
    'warn_dup_journal', 'sign_out_inactive',
];

    protected $casts = [
        'close_books' => 'boolean',
        'enable_acct_nums' => 'boolean',
        'auto_prefill' => 'boolean',
        'auto_invoice_groups' => 'boolean',
        'auto_apply_bills' => 'boolean',
        'warn_dup_cheque' => 'boolean',
        'warn_dup_bill' => 'boolean',
        'warn_dup_journal' => 'boolean',
    ];
}
