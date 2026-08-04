<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class BankDeposit extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'deposit_no', 'deposit_date', 'deposit_to_account_id', 'cash_back_account_id', 'cash_back_memo', 'cash_back_amount', 'total_amount', 'memo', 'status'
    ];

    public function items()
    {
        return $this->hasMany(BankDepositItem::class);
    }
}
