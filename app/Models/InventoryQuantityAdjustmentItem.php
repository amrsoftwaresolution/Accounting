<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryQuantityAdjustmentItem extends Model
{
    use HasUuids;

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

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
