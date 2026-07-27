<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'payee_id', 'payee_type', 'payment_account_id',
        'payment_date', 'payment_method_id', 'reference_no',
        'total_amount', 'memo', 'status'
    ];

    public function items()
    {
        return $this->hasMany(PaymentItem::class);
    }
    public function journalEntry()
    {
        return $this->morphOne(JournalEntry::class, 'transactionable');
    }
}
