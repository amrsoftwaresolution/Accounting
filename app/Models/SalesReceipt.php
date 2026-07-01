<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SalesReceipt extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'receipt_no', 'customer_id', 'email', 'receipt_date', 'payment_method_id',
        'deposit_to_account_id', 'currency_id', 'exchange_rate', 'total_amount', 'memo', 'statement_message', 'status'
    ];

    public function items()
    {
        return $this->hasMany(SalesReceiptItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
