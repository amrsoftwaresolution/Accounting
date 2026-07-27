<?php

namespace App\Observers;

use App\Models\Accounting\JournalEntryLine;
use App\Models\Accounting\ChartOfAcc;

class JournalEntryLineObserver
{
    /**
     * Handle the JournalEntryLine "created" event.
     */
    public function created(JournalEntryLine $line): void
    {
        // Balance is now computed dynamically.
    }

    /**
     * Handle the JournalEntryLine "updated" event.
     */
    public function updated(JournalEntryLine $line): void
    {
        // Balance is now computed dynamically.
    }

    /**
     * Handle the JournalEntryLine "deleted" event.
     */
    public function deleted(JournalEntryLine $line): void
    {
        // Balance is now computed dynamically.
    }
}
