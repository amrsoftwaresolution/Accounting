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
    private function buildAccountTree($types, $lines, $isBalanceSheet = false)
    {
        $allAccounts = ChartOfAcc::where('company_id', session('active_company_id'))
            ->whereIn('account_type', $types)
            ->get();

        $accountBalances = [];
        foreach ($allAccounts as $account) {
            $line = $lines->get($account->id);
            $total_debit = $line ? $line->total_debit : 0;
            $total_credit = $line ? $line->total_credit : 0;
            
            $type = strtolower($account->account_type);
            if ($type === 'income' || $type === 'liability' || $type === 'equity') {
                $balance = $total_credit - $total_debit;
            } else if ($type === 'expense' || $type === 'asset') {
                $balance = $total_debit - $total_credit;
            } else {
                $balance = 0;
            }

            $accountBalances[$account->id] = [
                'id' => $account->id,
                'name' => $account->name,
                'account_type' => $type,
                'sub_type' => $account->sub_type,
                'parent_id' => $account->parent_id,
                'balance' => (float) $balance,
                'total_balance' => (float) $balance,
                'children' => []
            ];
        }

        $tree = [];
        // First pass, assign to parents
        foreach ($accountBalances as $id => &$node) {
            if ($node['parent_id'] && isset($accountBalances[$node['parent_id']])) {
                $accountBalances[$node['parent_id']]['children'][] = &$node;
            } else {
                $tree[] = &$node;
            }
        }
        
        // Helper to roll up balances
        $rollup = function(&$node) use (&$rollup) {
            $total = $node['balance'];
            foreach ($node['children'] as &$child) {
                $total += $rollup($child);
            }
            $node['total_balance'] = $total;
            return $total;
        };

        foreach ($tree as &$node) {
            $rollup($node);
        }

        // Filter out nodes with 0 total_balance to keep report clean
        $filterZero = function($nodes) use (&$filterZero) {
            $result = [];
            foreach ($nodes as $node) {
                $node['children'] = $filterZero($node['children']);
                if ($node['total_balance'] != 0 || count($node['children']) > 0) {
                    $result[] = $node;
                }
            }
            return $result;
        };

        $tree = $filterZero($tree);

        return collect($tree)->groupBy('account_type');
    }

    public function profitAndLoss(Request $request)
    {
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->endOfMonth()->toDateString());

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->select(
                'journal_entry_lines.chart_of_acc_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entry_lines.chart_of_acc_id')
            ->get()
            ->keyBy('chart_of_acc_id');

        $reportData = $this->buildAccountTree(['income', 'expense'], $lines);

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
        $endDate = $request->query('end_date', now()->toDateString());

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entries.date', '<=', $endDate)
            ->select(
                'journal_entry_lines.chart_of_acc_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entry_lines.chart_of_acc_id')
            ->get()
            ->keyBy('chart_of_acc_id');

        $reportData = $this->buildAccountTree(['asset', 'liability', 'equity'], $lines, true);

        return Inertia::render('Reports/BalanceSheet', [
            'reportData' => $reportData,
            'filters' => [
                'end_date' => $endDate
            ]
        ]);
    }

    public function customerBalance(Request $request)
    {
        $endDate = $request->query('end_date', now()->toDateString());

        $customers = Customer::where('company_id', session('active_company_id'))->get();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entry_lines.payee_type', Customer::class)
            ->where('chart_of_accs.sub_type', 'accounts-receivable')
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

        $suppliers = Supplier::where('company_id', session('active_company_id'))->get();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entry_lines.payee_type', Supplier::class)
            ->where('chart_of_accs.sub_type', 'accounts-payable')
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
