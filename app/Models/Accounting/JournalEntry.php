<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\User;

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
        'payee_id',
        'payee_type',
        'payment_method_id',
        'total_amount',
        'status',
        'created_by',
    ];

    public function transactionable()
    {
        return $this->morphTo();
    }

    public function payee()
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
