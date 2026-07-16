<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'customer_id', 'amount', 'payment_date',
        'payment_method_id', 'deposit_to_account_id', 'reference_no', 'memo'
    ];

    public function allocations()
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
