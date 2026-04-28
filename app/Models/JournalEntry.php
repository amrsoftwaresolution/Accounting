<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class JournalEntry extends Model
{
    use HasUuids;

    protected $fillable = [
        'date',
        'reference',
        'description',
        'transaction_type',
        'transactionable_id',
        'transactionable_type',
        'total_amount',
        'status',
        'created_by',
    ];

    public function transactionable()
    {
        return $this->morphTo();
    }

    public function lines()
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
