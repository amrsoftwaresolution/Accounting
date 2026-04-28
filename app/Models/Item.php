<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Item extends Model
{
    use HasUuids;

    protected $fillable = [
        'type',
        'name',
        'sku',
        'image',
        'description',
        'price',
        'item_category_id',
        'income_account_id',
    ];

    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'item_category_id');
    }

    public function incomeAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'income_account_id');
    }
}
