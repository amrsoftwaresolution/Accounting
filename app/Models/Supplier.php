<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Supplier extends Model
{
    use HasUuids;

    protected $fillable = [
        'display_name',
        'first_name',
        'last_name',
        'company_name',
        'email',
        'phone_number',
        'tax_id',
        'address',
        'opening_balance',
    ];

    protected $appends = ['balance'];

    public function getBalanceAttribute()
    {
        // Calculate AP Balance for Supplier
        $apAccountIds = \App\Models\Accounting\ChartOfAcc::where('sub_type', 'accounts-payable')
            
            ->pluck('id');
            
        $debits = \App\Models\Accounting\JournalEntryLine::where('payee_id', $this->id)
            ->whereIn('chart_of_acc_id', $apAccountIds)
            ->sum('debit');
            
        $credits = \App\Models\Accounting\JournalEntryLine::where('payee_id', $this->id)
            ->whereIn('chart_of_acc_id', $apAccountIds)
            ->sum('credit');

        return ($this->opening_balance ?? 0) + $credits - $debits;
    }
}
