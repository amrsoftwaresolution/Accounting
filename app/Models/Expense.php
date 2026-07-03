<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Expense extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'payee_id', 'payee_type', 'payment_account_id',
        'payment_date', 'payment_method_id', 'reference_no',
        'total_amount', 'memo', 'status',
        'currency_id', 'exchange_rate', 'amount_in_base_currency'
    ];

    public function items()
    {
        return $this->hasMany(ExpenseItem::class);
    }
}
