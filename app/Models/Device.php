<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;

class Device extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = [
        'company_id',
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
