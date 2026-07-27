<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvoiceReturn extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id', 'email', 'credit_note_date', 
        'total_amount', 'memo', 'statement_message', 'status'
    ];

    public function items()
    {
        return $this->hasMany(InvoiceReturnItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
    public function journalEntry()
    {
        return $this->morphOne(JournalEntry::class, 'transactionable');
    }
}
