<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvoiceItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'invoice_id', 'item_id', 'description', 'quantity', 'rate', 'amount', 'service_date'
    ];
}
