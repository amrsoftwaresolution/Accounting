<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $fillable = [
        'name',
        'code',
        'symbol',
        'exchange_rate',
        'is_base_currency',
    ];
    
    public function companies()
    {
        return $this->hasMany(Company::class);
    }
}