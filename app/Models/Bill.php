<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Bill extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'supplier_id', 'email', 'bill_date',
        'due_date', 'bill_no', 'total_amount', 'memo', 'status'
    ];

    public function items()
    {
        return $this->hasMany(BillItem::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
