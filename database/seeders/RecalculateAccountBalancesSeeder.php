<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChartOfAcc;
use App\Models\JournalEntryLine;

class RecalculateAccountBalancesSeeder extends Seeder
{
    public function run()
    {
        // Get accounts for company_id = 4
        $accounts = ChartOfAcc::where('company_id', 4)->get();

        foreach ($accounts as $account) {
            $debits = JournalEntryLine::where('chart_of_acc_id', $account->id)->sum('debit');
            $credits = JournalEntryLine::where('chart_of_acc_id', $account->id)->sum('credit');

            $type = strtolower($account->account_type);

            if (in_array($type, ['asset', 'expense'])) {
                $balance = $debits - $credits;
            } else {
                $balance = $credits - $debits;
            }

            $account->update(['balance' => $balance]);
            $this->command->info("Account [{$account->account_code} - {$account->name}] balance updated to {$balance}");
        }
        
        $this->command->info("All account balances recalculated successfully.");
    }
}
