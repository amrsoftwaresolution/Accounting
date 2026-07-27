<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'vehicle_type',
        'brand',
        'model',
        'fuel_type',
        'customer_id',
        'vehicle_no',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
