<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SalesReceiptItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'sales_receipt_id', 'item_id', 'description', 'quantity', 'rate', 'amount', 'service_date'
    ];
}
