<?php

namespace App\Observers;

use App\Models\JournalEntryLine;
use App\Models\ChartOfAcc;

class JournalEntryLineObserver
{
    /**
     * Handle the JournalEntryLine "created" event.
     */
    public function created(JournalEntryLine $line): void
    {
        ChartOfAcc::adjustBalance($line->chart_of_acc_id, $line->debit, $line->credit);
    }

    /**
     * Handle the JournalEntryLine "updated" event.
     */
    public function updated(JournalEntryLine $line): void
    {
        // Subtract old values
        ChartOfAcc::adjustBalance($line->chart_of_acc_id, -$line->getOriginal('debit'), -$line->getOriginal('credit'));
        
        // Add new values
        ChartOfAcc::adjustBalance($line->chart_of_acc_id, $line->debit, $line->credit);
    }

    /**
     * Handle the JournalEntryLine "deleted" event.
     */
    public function deleted(JournalEntryLine $line): void
    {
        ChartOfAcc::adjustBalance($line->chart_of_acc_id, -$line->debit, -$line->credit);
    }
}
