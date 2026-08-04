<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class ChequeDepositItem extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'cheque_deposit_id',
        'receive_payment_id',
        'amount',
    ];

    public function chequeDeposit()
    {
        return $this->belongsTo(ChequeDeposit::class);
    }

    public function receivePayment()
    {
        return $this->belongsTo(ReceivePayment::class);
    }
}
