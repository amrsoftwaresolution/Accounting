<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ExpenseItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'expense_id', 'chart_of_acc_id', 'description', 'amount'
    ];
}
