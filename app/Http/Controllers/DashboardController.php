<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ChartOfAcc;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $companyId = session('active_company_id');
        
        // 1. Bank Accounts
        $bankAccounts = ChartOfAcc::where('company_id', $companyId)
            ->whereIn('account_type', ['bank', 'credit_card'])
            ->get()
            ->map(function ($account) {
                // Calculate balance from journal entry lines
                // Debit increases Bank, Credit decreases Bank. Credit Card is opposite.
                $balance = JournalEntryLine::where('chart_of_acc_id', $account->id)
                    ->whereHas('journalEntry', function($q) use ($companyId) {
                        $q->where('company_id', $companyId);
                    })
                    ->get()
                    ->reduce(function ($carry, $line) use ($account) {
                        if ($account->account_type === 'bank') {
                            return $carry + ($line->debit - $line->credit);
                        } else {
                            // Credit Card
                            return $carry + ($line->credit - $line->debit);
                        }
                    }, 0);
                    
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'type' => $account->account_type,
                    'balance' => $balance
                ];
            });

        // 2. Profit & Loss (Income vs Expenses) for current year grouped by month
        $currentYear = Carbon::now()->year;
        
        // Income lines
        $incomeData = JournalEntryLine::whereHas('account', function($q) {
                $q->whereIn('account_type', ['income', 'other_income']);
            })
            ->whereHas('journalEntry', function($q) use ($companyId, $currentYear) {
                $q->where('company_id', $companyId)
                  ->whereYear('date', $currentYear);
            })
            ->selectRaw('MONTH(journal_entries.date) as month, SUM(journal_entry_lines.credit - journal_entry_lines.debit) as total')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->groupBy('month')
            ->pluck('total', 'month')->toArray();

        // Expense lines
        $expenseData = JournalEntryLine::whereHas('account', function($q) {
                $q->whereIn('account_type', ['expense', 'cost_of_goods_sold']);
            })
            ->whereHas('journalEntry', function($q) use ($companyId, $currentYear) {
                $q->where('company_id', $companyId)
                  ->whereYear('date', $currentYear);
            })
            ->selectRaw('MONTH(journal_entries.date) as month, SUM(journal_entry_lines.debit - journal_entry_lines.credit) as total')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->groupBy('month')
            ->pluck('total', 'month')->toArray();

        $monthlyPnL = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthName = Carbon::create()->month($i)->shortMonthName;
            $income = isset($incomeData[$i]) ? (float)$incomeData[$i] : 0;
            $expense = isset($expenseData[$i]) ? (float)$expenseData[$i] : 0;
            
            $monthlyPnL[] = [
                'name' => $monthName,
                'Income' => $income,
                'Expenses' => $expense,
                'Profit' => $income - $expense
            ];
        }

        // 3. Expenses Breakdown for current month
        $currentMonth = Carbon::now()->month;
        $expensesBreakdown = JournalEntryLine::whereHas('account', function($q) {
                $q->whereIn('account_type', ['expense', 'cost_of_goods_sold']);
            })
            ->whereHas('journalEntry', function($q) use ($companyId, $currentYear, $currentMonth) {
                $q->where('company_id', $companyId)
                  ->whereYear('date', $currentYear)
                  ->whereMonth('date', $currentMonth);
            })
            ->selectRaw('chart_of_accs.name as name, SUM(journal_entry_lines.debit - journal_entry_lines.credit) as value')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->groupBy('chart_of_accs.name')
            ->havingRaw('value > 0')
            ->orderByDesc('value')
            ->take(5) // Top 5 expenses
            ->get();

        return Inertia::render('Dashboard', [
            'bankAccounts' => $bankAccounts,
            'monthlyPnL' => $monthlyPnL,
            'expensesBreakdown' => $expensesBreakdown
        ]);
    }
}
