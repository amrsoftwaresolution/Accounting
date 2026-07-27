<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BillReturnItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'bill_return_id', 'item_id', 'chart_of_acc_id', 'description', 'quantity', 'rate', 'amount'
    ];

    public function item()
    {
        return $this->belongsTo(\App\Models\Item::class);
    }

    public function chartOfAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'chart_of_acc_id');
    }
}
