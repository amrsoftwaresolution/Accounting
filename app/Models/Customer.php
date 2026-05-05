<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;

class Customer extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = [
        'company_id',
        'display_name',
        'first_name',
        'last_name',
        'company_name',
        'email',
        'phone_number',
        'tax_id',
        'opening_balance',
    ];

    /**
     * Get all of the customer's addresses.
     */
    public function addresses()
    {
        return $this->morphMany(Address::class, 'addressable');
    }
}
