<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BankDeposit extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'deposit_no', 'deposit_date', 'deposit_to_account_id', 'currency_id', 'exchange_rate', 'cash_back_account_id', 'cash_back_memo', 'cash_back_amount', 'total_amount', 'memo', 'status'
    ];

    public function items()
    {
        return $this->hasMany(BankDepositItem::class);
    }
}
