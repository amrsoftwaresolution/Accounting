<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class PaymentItem extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'payment_id', 'item_id', 'chart_of_acc_id', 'description', 'quantity', 'rate', 'amount'
    ];
}
