<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class Employee extends Model
{
    use HasUuids;

    protected $fillable = [
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
