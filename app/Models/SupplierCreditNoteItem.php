<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SupplierCreditNoteItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'supplier_credit_note_id', 'item_id', 'chart_of_acc_id', 'description', 'quantity', 'rate', 'amount'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function chartOfAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'chart_of_acc_id');
    }
}
