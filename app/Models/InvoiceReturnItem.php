<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvoiceReturnItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'invoice_return_id', 'item_id', 'description', 'quantity', 'rate', 'amount'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
