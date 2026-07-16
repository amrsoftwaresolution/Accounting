<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;

class Supplier extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = [
        'company_id',
        'display_name',
        'first_name',
        'last_name',
        'company_name',
        'email',
        'phone_number',
        'tax_id',
        'opening_balance',
    ];

    protected $appends = ['balance'];

    /**
     * Get all of the supplier's addresses.
     */
    public function addresses()
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function getBalanceAttribute()
    {
        // Calculate AP Balance for Supplier
        $apAccountIds = \App\Models\ChartOfAcc::where('sub_type', 'accounts-payable')
            ->where('company_id', $this->company_id)
            ->pluck('id');
            
        $debits = \App\Models\JournalEntryLine::where('payee_id', $this->id)
            ->whereIn('chart_of_acc_id', $apAccountIds)
            ->sum('debit');
            
        $credits = \App\Models\JournalEntryLine::where('payee_id', $this->id)
            ->whereIn('chart_of_acc_id', $apAccountIds)
            ->sum('credit');

        return ($this->opening_balance ?? 0) + $credits - $debits;
    }
}
