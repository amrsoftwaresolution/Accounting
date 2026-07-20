<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvancedSettings extends Model
{
    protected $fillable = [
    'acct_method', 'fin_year_start', 'tax_year_start', 'close_books',
    'tax_form', 'warn_dup_cheque', 'warn_dup_bill',
    'warn_dup_journal', 'sign_out_inactive',
];

    protected $casts = [
        'close_books' => 'boolean',
        'warn_dup_cheque' => 'boolean',
        'warn_dup_bill' => 'boolean',
        'warn_dup_journal' => 'boolean',
    ];
}
