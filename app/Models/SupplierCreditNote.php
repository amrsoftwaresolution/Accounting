<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SupplierCreditNote extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'supplier_id', 'credit_date', 
        'total_amount', 'memo', 'status'
    ];

    public function items()
    {
        return $this->hasMany(SupplierCreditNoteItem::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
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
