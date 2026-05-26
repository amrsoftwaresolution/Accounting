<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BundleItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'bundle_id',
        'item_id',
        'quantity',
    ];

    public function bundle()
    {
        return $this->belongsTo(Item::class, 'bundle_id');
    }

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
