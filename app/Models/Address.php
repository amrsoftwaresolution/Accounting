<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class Address extends Model
{
    use HasUuids;

    protected $fillable = [
        'addressable_id',
        'addressable_type',
        'type',
        'address_line_1',
        'address_line_2',
        'city',
        'province',
        'postal_code',
        'country',
    ];

    public function addressable()
    {
        return $this->morphTo();
    }
}
