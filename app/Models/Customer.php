<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;
use App\Models\ChartOfAcc;
use App\Models\JournalEntryLine;

class Customer extends Model
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
     * Get all of the customer's addresses.
     */
    public function addresses()
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    /**
     * Get all of the customer's devices.
     */
    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    public function getBalanceAttribute()
    {
        // Calculate AR Balance for Customer
        $arAccountIds = ChartOfAcc::where('sub_type', 'accounts-receivable')
            ->where('company_id', $this->company_id)
            ->pluck('id');
            
        $debits = JournalEntryLine::where('payee_id', $this->id)
            ->whereIn('chart_of_acc_id', $arAccountIds)
            ->sum('debit');
            
        $credits = JournalEntryLine::where('payee_id', $this->id)
            ->whereIn('chart_of_acc_id', $arAccountIds)
            ->sum('credit');

        return ($this->opening_balance ?? 0) + $debits - $credits;
    }
}
