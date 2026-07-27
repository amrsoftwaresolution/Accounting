<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PaymentItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'payment_id', 'item_id', 'chart_of_acc_id', 'description', 'quantity', 'rate', 'amount'
    ];
}
