<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChartOfAcc;
use App\Models\JournalEntryLine;
use App\Models\Customer;
use App\Models\Supplier;
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

    public function customerBalance(Request $request)
    {
        $endDate = $request->query('end_date', now()->toDateString());

        $customers = Customer::all();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entry_lines.payee_type', Customer::class)
            ->where('chart_of_accs.sub_type', 'accounts_receivable')
            ->where('journal_entries.date', '<=', $endDate)
            ->select(
                'journal_entry_lines.payee_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entry_lines.payee_id')
            ->get()
            ->keyBy('payee_id');

        $reportData = $customers->map(function ($customer) use ($lines) {
            $line = $lines->get($customer->id);
            $balance = $customer->opening_balance ?? 0;
            if ($line) {
                $balance += ($line->total_debit - $line->total_credit);
            }

            return [
                'id' => $customer->id,
                'name' => $customer->display_name ?: $customer->company_name,
                'email' => $customer->email,
                'phone' => $customer->phone_number,
                'balance' => (float) $balance
            ];
        })->filter(function ($item) {
            return $item['balance'] != 0;
        })->values();

        return Inertia::render('Reports/CustomerBalance', [
            'reportData' => $reportData,
            'filters' => [
                'end_date' => $endDate
            ]
        ]);
    }

    public function supplierBalance(Request $request)
    {
        $endDate = $request->query('end_date', now()->toDateString());

        $suppliers = Supplier::all();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entry_lines.payee_type', Supplier::class)
            ->where('chart_of_accs.sub_type', 'accounts_payable')
            ->where('journal_entries.date', '<=', $endDate)
            ->select(
                'journal_entry_lines.payee_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entry_lines.payee_id')
            ->get()
            ->keyBy('payee_id');

        $reportData = $suppliers->map(function ($supplier) use ($lines) {
            $line = $lines->get($supplier->id);
            $balance = $supplier->opening_balance ?? 0;
            // Liability: Credit - Debit
            if ($line) {
                $balance += ($line->total_credit - $line->total_debit);
            }

            return [
                'id' => $supplier->id,
                'name' => $supplier->display_name ?: $supplier->company_name,
                'email' => $supplier->email,
                'phone' => $supplier->phone_number,
                'balance' => (float) $balance
            ];
        })->filter(function ($item) {
            return $item['balance'] != 0;
        })->values();

        return Inertia::render('Reports/SupplierBalance', [
            'reportData' => $reportData,
            'filters' => [
                'end_date' => $endDate
            ]
        ]);
    }
}
