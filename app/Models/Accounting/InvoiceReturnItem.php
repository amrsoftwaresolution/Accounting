<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class InvoiceReturnItem extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'invoice_return_id', 'item_id', 'description', 'quantity', 'rate', 'amount'
    ];

    public function item()
    {
        return $this->belongsTo(\App\Models\Item::class);
    }
}
