<?php

namespace App\Models\Accounting;

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
        return $this->belongsTo(\App\Models\Item::class);
    }

    public function invoice()
    {
        return $this->belongsTo(SalesInvoice::class, 'sales_invoice_id');
    }

    public function warranty()
    {
        return $this->hasOne(\App\Models\Warranty::class, 'invoice_item_id');
    }
}
