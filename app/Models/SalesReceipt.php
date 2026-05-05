<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesReceipt extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'customer_id',
        'email',
        'billing_address',
        'date',
        'payment_method',
        'reference_no',
        'deposit_to',
        'receipt_no',
        'message_on_receipt',
        'message_on_statement',
        'items',
        'total_amount',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'decimal:2',
    ];
}
