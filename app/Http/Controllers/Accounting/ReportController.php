<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChartOfAcc;
use App\Models\JournalEntryLine;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function profitAndLoss(Request $request)
    {
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->endOfMonth()->toDateString());

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->select(
                'chart_of_accs.name as account_name',
                'chart_of_accs.account_type',
                'chart_of_accs.sub_type',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('chart_of_accs.id', 'chart_of_accs.name', 'chart_of_accs.account_type', 'chart_of_accs.sub_type')
            ->get();

        $reportData = $lines->groupBy('account_type')->map(function ($group, $type) {
            return $group->map(function ($item) use ($type) {
                // Income: Credit - Debit
                // Expense: Debit - Credit
                $balance = ($type === 'income') ? ($item->total_credit - $item->total_debit) : ($item->total_debit - $item->total_credit);
                return [
                    'name' => $item->account_name,
                    'sub_type' => $item->sub_type,
                    'balance' => (float) $balance
                ];
            });
        });

        return Inertia::render('Reports/ProfitAndLoss', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->select(
                'chart_of_accs.name as account_name',
                'chart_of_accs.account_type',
                'chart_of_accs.sub_type',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('chart_of_accs.id', 'chart_of_accs.name', 'chart_of_accs.account_type', 'chart_of_accs.sub_type')
            ->get();

        $reportData = $lines->groupBy('account_type')->map(function ($group, $type) {
            return $group->map(function ($item) use ($type) {
                // Asset: Debit - Credit
                // Liability/Equity: Credit - Debit
                $balance = ($type === 'asset') ? ($item->total_debit - $item->total_credit) : ($item->total_credit - $item->total_debit);
                return [
                    'name' => $item->account_name,
                    'sub_type' => $item->sub_type,
                    'balance' => (float) $balance
                ];
            });
        });

        return Inertia::render('Reports/BalanceSheet', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }
}
