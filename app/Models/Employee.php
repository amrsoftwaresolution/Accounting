<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Employee extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'email',
        'employee_id',
        'designation',
        'salary',
        'join_date',
    ];


}
