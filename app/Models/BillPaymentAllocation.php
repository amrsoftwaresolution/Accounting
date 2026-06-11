<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BillPaymentAllocation extends Model
{
    use HasUuids;

    protected $fillable = [
        'bill_payment_id', 'bill_id', 'amount_applied'
    ];

    public function billPayment()
    {
        return $this->belongsTo(BillPayment::class);
    }

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }
}
