<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Accounting\ChartOfAcc;

class Item extends Model
{
    use HasUuids;

    protected $fillable = [
        'type',
        'name',
        'sku',
        'image',
        'description',
        'sale_price',
        'item_category_id',
        'income_account_id',
        'purchase_price',
        'expense_account_id',
        'track_inventory',
        'quantity_on_hand',
        'inventory_account_id',
        'as_of_date',
        'reorder_point',
        'purchase_description',
        'preferred_supplier_id',
        'is_sold',
        'is_purchased',
    ];

    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'item_category_id');
    }

    public function incomeAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'income_account_id');
    }

    public function expenseAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'expense_account_id');
    }

    public function inventoryAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'inventory_account_id');
    }

    public function preferredSupplier()
    {
        return $this->belongsTo(Supplier::class, 'preferred_supplier_id');
    }

    public function bundleComponents()
    {
        return $this->hasMany(BundleItem::class, 'bundle_id');
    }
}
