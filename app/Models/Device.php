<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Device extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'type',
        'brand',
        'model',
        'year',
        'vehicle_number',
        'chassis_number',
        'engine_number',
        'fuel_type',
        'color',
        'mileage',
        'serial_number',
        'imei',
        'warranty'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
