<?php

namespace App\Models;

use App\Traits\HasCompany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryQuantityAdjustment extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = [
        'company_id',
        'adjustment_date',
        'reference_number',
        'adjustment_reason',
        'inventory_adjustment_account_id',
        'memo',
    ];

    protected $casts = [
        'adjustment_date' => 'date',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(ChartOfAcc::class, 'inventory_adjustment_account_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryQuantityAdjustmentItem::class, 'inventory_quantity_adjustment_id');
    }
}
