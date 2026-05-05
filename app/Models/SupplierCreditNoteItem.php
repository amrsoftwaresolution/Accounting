<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SupplierCreditNoteItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'supplier_credit_note_id', 'item_id', 'description', 'quantity', 'rate', 'amount'
    ];
}
