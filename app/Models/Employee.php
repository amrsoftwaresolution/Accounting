<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;

class Employee extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = [
        'company_id',
        'user_id',
        'employee_id',
        'designation',
        'salary',
        'join_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
