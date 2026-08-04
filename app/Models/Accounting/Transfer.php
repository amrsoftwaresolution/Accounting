<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class Transfer extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'from_account_id', 'to_account_id',
        'amount', 'date', 'memo', 'reference_no'
    ];
    public function journalEntry()
    {
        return $this->morphOne(JournalEntry::class, 'transactionable');
    }
}
