<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BillReturn extends Model
{
    use HasUuids;

    protected $fillable = [
        'supplier_id', 'date', 
        'total_amount', 'memo', 'status'
    ];

    public function items()
    {
        return $this->hasMany(BillReturnItem::class);
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
