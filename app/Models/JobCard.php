<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;

class JobCard extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = [
        'company_id',
        'customer_id',
        'device_id',
        'job_card_number',
        'service_date',
        'complaint',
        'technician_assigned',
        'estimated_delivery_date',
        'estimated_cost',
        'photos',
        'customer_signature',
        'status'
    ];

    protected $casts = [
        'service_date' => 'date',
        'estimated_delivery_date' => 'date',
        'estimated_cost' => 'decimal:2',
        'photos' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
