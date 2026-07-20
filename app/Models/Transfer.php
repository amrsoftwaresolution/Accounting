<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transfer extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id', 'from_account_id', 'to_account_id',
        'amount', 'date', 'memo', 'reference_no'
    ];
    public function journalEntry()
    {
        return $this->morphOne(JournalEntry::class, 'transactionable');
    }
}
