<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SalesInvoiceItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'sales_invoice_id', 'item_id', 'description', 'quantity', 'rate', 'amount', 'service_date'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
