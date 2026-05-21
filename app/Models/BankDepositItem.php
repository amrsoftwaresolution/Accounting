<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BankDepositItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'bank_deposit_id', 'received_from', 'account_id', 'description', 'payment_method_id', 'ref_no', 'amount'
    ];

    public function deposit()
    {
        return $this->belongsTo(BankDeposit::class, 'bank_deposit_id');
    }
}
