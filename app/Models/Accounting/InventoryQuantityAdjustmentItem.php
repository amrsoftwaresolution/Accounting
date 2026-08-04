<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;

class InventoryQuantityAdjustmentItem extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'inventory_quantity_adjustment_id',
        'item_id',
        'description',
        'qty_on_hand',
        'new_qty',
        'change_in_qty',
    ];

    public function adjustment(): BelongsTo
    {
        return $this->belongsTo(InventoryQuantityAdjustment::class, 'inventory_quantity_adjustment_id');
    }

    public function item()
    {
        return $this->belongsTo(\App\Models\Item::class, 'item_id');
    }
}
