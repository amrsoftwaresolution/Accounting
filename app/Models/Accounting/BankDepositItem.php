<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class BankDepositItem extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'bank_deposit_id', 'received_from', 'account_id', 'description', 'payment_method_id', 'ref_no', 'amount'
    ];

    public function deposit()
    {
        return $this->belongsTo(BankDeposit::class, 'bank_deposit_id');
    }
}
