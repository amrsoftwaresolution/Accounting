<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class JournalEntryLine extends Model
{
    use HasUuids;

    protected $fillable = [
        'journal_entry_id',
        'chart_of_acc_id',
        'debit',
        'credit',
        'memo',
    ];

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function account()
    {
        return $this->belongsTo(ChartOfAcc::class, 'chart_of_acc_id');
    }
}
