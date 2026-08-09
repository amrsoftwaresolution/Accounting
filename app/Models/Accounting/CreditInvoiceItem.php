<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class CreditInvoiceItem extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'credit_invoice_id', 'item_id', 'description', 'quantity', 'rate', 'amount', 'service_date'
    ];

    public function item()
    {
        return $this->belongsTo(\App\Models\Item::class);
    }

    public function invoice()
    {
        return $this->belongsTo(CreditInvoice::class, 'credit_invoice_id');
    }
}
