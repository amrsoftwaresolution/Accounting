<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;

class PaymentMethod extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = ['company_id', 'name', 'slug', 'is_active'];
}
