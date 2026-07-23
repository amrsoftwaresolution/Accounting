<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    
protected $fillable = [
    'registration_number',
    'vehicle_type',
    'brand',
    'model',
    'fuel_type',
];
}
