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
    public function index()
    {
        return Inertia::render('Reports/Index');
    }
    private function buildAccountTree($types, $lines, $isBalanceSheet = false)
    {
        $allAccounts = ChartOfAcc::where('company_id', session('active_company_id'))
            ->whereIn('account_type', $types)
            ->orderByRaw('FIELD(account_type, "Asset", "Liability", "Equity", "Income", "Expense")')
            ->orderBy('sub_type')
            ->orderBy('name')
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

    private function buildPnLTree($types, $lines, $displayBy, $months)
    {
        $allAccounts = ChartOfAcc::where('company_id', session('active_company_id'))
            ->whereIn('account_type', $types)
            ->orderByRaw('FIELD(account_type, "Asset", "Liability", "Equity", "Income", "Expense")')
            ->orderBy('sub_type')
            ->orderBy('name')
            ->get();

        $accountBalances = [];
        foreach ($allAccounts as $account) {
            $accountLines = $lines->where('chart_of_acc_id', $account->id);
            $type = strtolower($account->account_type);

            $monthly_balances = [];
            $total_balance = 0;

            if ($displayBy === 'month') {
                foreach ($months as $month) {
                    $monthLine = $accountLines->firstWhere('month', $month);
                    $debit = $monthLine ? $monthLine->total_debit : 0;
                    $credit = $monthLine ? $monthLine->total_credit : 0;

                    if ($type === 'income') {
                        $balance = $credit - $debit;
                    } else {
                        $balance = $debit - $credit;
                    }
                    $monthly_balances[$month] = (float) $balance;
                    $total_balance += $balance;
                }
            } else {
                $line = $accountLines->first();
                $debit = $line ? $line->total_debit : 0;
                $credit = $line ? $line->total_credit : 0;
                if ($type === 'income') {
                    $total_balance = $credit - $debit;
                } else {
                    $total_balance = $debit - $credit;
                }
            }

            $accountBalances[$account->id] = [
                'id' => $account->id,
                'name' => $account->name,
                'account_type' => $type,
                'sub_type' => $account->sub_type,
                'parent_id' => $account->parent_id,
                'balance' => (float) $total_balance,
                'total_balance' => (float) $total_balance,
                'monthly_balances' => $monthly_balances,
                'total_monthly_balances' => $monthly_balances,
                'children' => []
            ];
        }

        $tree = [];
        foreach ($accountBalances as $id => &$node) {
            if ($node['parent_id'] && isset($accountBalances[$node['parent_id']])) {
                $accountBalances[$node['parent_id']]['children'][] = &$node;
            } else {
                $tree[] = &$node;
            }
        }

        $rollup = function(&$node) use (&$rollup, $displayBy, $months) {
            $total = $node['balance'];
            $monthly = $node['monthly_balances'];

            foreach ($node['children'] as &$child) {
                $total += $rollup($child);
                if ($displayBy === 'month') {
                    foreach ($months as $m) {
                        $monthly[$m] = ($monthly[$m] ?? 0) + ($child['total_monthly_balances'][$m] ?? 0);
                    }
                }
            }
            $node['total_balance'] = $total;
            if ($displayBy === 'month') {
                $node['total_monthly_balances'] = $monthly;
            }
            return $total;
        };

        foreach ($tree as &$node) {
            $rollup($node);
        }

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

        return collect($tree)->groupBy(function ($item) {
            if ($item['sub_type'] === 'cost-of-goods-sold') {
                return 'cogs';
            }
            return $item['account_type'];
        });
    }

    public function profitAndLoss(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $displayBy = $request->query('display_by', 'total');

        if (!$request->has('start_date') && !$request->has('end_date')) {
            $startDate = now()->startOfMonth()->toDateString();
            $endDate = now()->endOfMonth()->toDateString();
        }

        $query = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->select(
                'journal_entry_lines.chart_of_acc_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            );

        if ($startDate) {
            $query->where('journal_entries.date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        if ($displayBy === 'month') {
            $query->addSelect(DB::raw('DATE_FORMAT(journal_entries.date, "%Y-%m") as month'))
                  ->groupBy('journal_entry_lines.chart_of_acc_id', 'month');
        } else {
            $query->groupBy('journal_entry_lines.chart_of_acc_id');
        }

        $lines = $query->get();

        $months = [];
        if ($displayBy === 'month') {
            $actualStart = $startDate ? \Carbon\Carbon::parse($startDate) : ($lines->min('month') ? \Carbon\Carbon::createFromFormat('Y-m', $lines->min('month')) : now());
            $actualEnd = $endDate ? \Carbon\Carbon::parse($endDate) : ($lines->max('month') ? \Carbon\Carbon::createFromFormat('Y-m', $lines->max('month')) : now());
            
            $start = $actualStart->copy()->startOfMonth();
            $end = $actualEnd->copy()->startOfMonth();
            while ($start->lte($end)) {
                $months[] = $start->format('Y-m');
                $start->addMonth();
            }
        }

        $reportData = $this->buildPnLTree(['income', 'expense'], $lines, $displayBy, $months);

        return Inertia::render('Reports/ProfitAndLoss', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'display_by' => $displayBy,
                'months' => $months
            ]
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $endDate = $request->query('end_date');
        $endDate = $endDate !== null && $endDate !== '' ? $endDate : now()->toDateString();

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

        $fiscalYearStart = \Carbon\Carbon::parse($endDate)->startOfYear()->toDateString();

        // 1. Prior Years Net Income (Retained Earnings)
        $priorNetIncomeResult = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entries.date', '<', $fiscalYearStart)
            ->whereIn('chart_of_accs.account_type', ['income', 'expense'])
            ->select(
                DB::raw('SUM(CASE WHEN chart_of_accs.account_type = "income" THEN journal_entry_lines.credit - journal_entry_lines.debit ELSE journal_entry_lines.credit - journal_entry_lines.debit END) as retained_earnings')
            )->first();

        $retainedEarningsAmount = $priorNetIncomeResult ? (float) $priorNetIncomeResult->retained_earnings : 0;

        // 2. Current Year Net Income
        $currentNetIncomeResult = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->whereBetween('journal_entries.date', [$fiscalYearStart, $endDate])
            ->whereIn('chart_of_accs.account_type', ['income', 'expense'])
            ->select(
                DB::raw('SUM(CASE WHEN chart_of_accs.account_type = "income" THEN journal_entry_lines.credit - journal_entry_lines.debit ELSE journal_entry_lines.credit - journal_entry_lines.debit END) as net_income')
            )->first();

        $netIncomeAmount = $currentNetIncomeResult ? (float) $currentNetIncomeResult->net_income : 0;

        $equity = $reportData->get('equity', collect());

        if ($retainedEarningsAmount != 0) {
            // Find existing retained earnings if any
            $existingReIdx = $equity->search(function ($item) {
                return strtolower($item['name']) === 'retained earnings';
            });

            if ($existingReIdx !== false) {
                $item = $equity->get($existingReIdx);
                $item['balance'] += $retainedEarningsAmount;
                $item['total_balance'] += $retainedEarningsAmount;
                $equity->put($existingReIdx, $item);
            } else {
                $equity->push([
                    'id' => 'retained_earnings_computed',
                    'name' => 'Retained Earnings',
                    'account_type' => 'equity',
                    'sub_type' => '',
                    'parent_id' => null,
                    'balance' => $retainedEarningsAmount,
                    'total_balance' => $retainedEarningsAmount,
                    'children' => []
                ]);
            }
        }

        if ($netIncomeAmount != 0) {
            $equity->push([
                'id' => 'net_income_computed',
                'name' => 'Net Income',
                'account_type' => 'equity',
                'sub_type' => '',
                'parent_id' => null,
                'balance' => $netIncomeAmount,
                'total_balance' => $netIncomeAmount,
                'children' => []
            ]);
        }

        $reportData->put('equity', $equity);

        return Inertia::render('Reports/BalanceSheet', [
            'reportData' => $reportData,
            'filters' => [
                'end_date' => $endDate
            ]
        ]);
    }

    public function customerBalance(Request $request)
    {
        $endDate = $request->query('end_date');
        $endDate = $endDate !== null && $endDate !== '' ? $endDate : now()->toDateString();

        $customers = Customer::where('company_id', session('active_company_id'))->get();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entries.payee_type', Customer::class)
            ->where('chart_of_accs.sub_type', 'accounts-receivable')
            ->where('journal_entries.date', '<=', $endDate)
            ->select(
                'journal_entries.payee_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entries.payee_id')
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
        $endDate = $request->query('end_date');
        $endDate = $endDate !== null && $endDate !== '' ? $endDate : now()->toDateString();
        $suppliers = Supplier::where('company_id', session('active_company_id'))->get();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entries.payee_type', Supplier::class)
            ->where('chart_of_accs.sub_type', 'accounts-payable')
            ->where('journal_entries.date', '<=', $endDate)
            ->select(
                'journal_entries.payee_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entries.payee_id')
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

    public function customerDetail(Request $request, Customer $customer)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date', now()->toDateString());

        $query = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entries.payee_type', Customer::class)
            ->where('journal_entries.payee_id', $customer->id)
            ->where('chart_of_accs.sub_type', 'accounts-receivable');

        if ($startDate) {
            $query->whereBetween('journal_entries.date', [$startDate, $endDate]);
        } else {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        $lines = $query->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->select('journal_entry_lines.*', 'journal_entries.date', 'journal_entries.reference', 'journal_entries.transaction_type', 'journal_entries.due_date')
            ->get();

        return Inertia::render('Reports/ContactBalanceDetail', [
            'contact' => $customer,
            'contactType' => 'Customer',
            'lines' => $lines,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate
            ]
        ]);
    }

    public function supplierDetail(Request $request, Supplier $supplier)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date', now()->toDateString());

        $query = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', session('active_company_id'))
            ->where('journal_entries.payee_type', Supplier::class)
            ->where('journal_entries.payee_id', $supplier->id)
            ->where('chart_of_accs.sub_type', 'accounts-payable');

        if ($startDate) {
            $query->whereBetween('journal_entries.date', [$startDate, $endDate]);
        } else {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        $lines = $query->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->select('journal_entry_lines.*', 'journal_entries.date', 'journal_entries.reference', 'journal_entries.transaction_type', 'journal_entries.due_date')
            ->get();

        return Inertia::render('Reports/ContactBalanceDetail', [
            'contact' => $supplier,
            'contactType' => 'Supplier',
            'lines' => $lines,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate
            ]
        ]);
    }

    public function inventorySummary(Request $request)
    {
        $companyId = session('active_company_id');

        $items = \App\Models\Item::where('company_id', $companyId)
            ->where('track_inventory', true)
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'qty_on_hand' => (float)$item->quantity_on_hand,
                    'avg_cost' => (float)$item->purchase_price,
                    'asset_value' => (float)($item->quantity_on_hand * $item->purchase_price),
                ];
            });

        return Inertia::render('Reports/InventorySummary', [
            'reportData' => $items,
        ]);
    }

    public function inventoryDetail(Request $request, \App\Models\Item $item)
    {
        $companyId = session('active_company_id');
        if ($item->company_id !== $companyId || !$item->track_inventory) {
            abort(404);
        }

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date') ?: date('Y-m-d');

        // To get the inventory detail, we look for JournalEntryLines that touch the Inventory Asset account
        // However, we didn't tag the specific item on JournalEntryLines currently in this system (we rely on Item models).
        // Wait, looking at InventoryQuantityAdjustment, it saves the items. Bill and Invoice save the items. 
        // We can just query `journal_entry_lines` for `transactionable` ? No, journal lines are tied to JournalEntry.
        // Actually, the simplest way to get inventory transactions is from Journal Entries of types:
        // bill, invoice, supplier_credit, credit_note, inventory_adjustment where they contain the item.
        // But since we just want a simple view, let's just show a placeholder or basic transaction list for now.
        
        // As a simple approximation, we can look for `JournalEntry` lines where the description contains the item name.
        // But the best way is to look at the `items` relation if the transaction has one!
        // For now, let's fetch transactions that are likely related.
        $query = DB::table('journal_entries')
            ->join('journal_entry_lines', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.company_id', $companyId)
            ->where('chart_of_accs.sub_type', 'inventory')
            ->where('journal_entry_lines.memo', 'like', '%' . $item->name . '%');

        if ($startDate) {
            $query->whereBetween('journal_entries.date', [$startDate, $endDate]);
        } else {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        $lines = $query->select('journal_entry_lines.*', 'journal_entries.date', 'journal_entries.reference', 'journal_entries.transaction_type')
            ->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->get()
            ->map(function ($line) use ($item) {
                // Approximate quantity change based on cost
                $qtyChange = 0;
                if ($item->purchase_price > 0) {
                    if ($line->debit > 0) {
                        $qtyChange = $line->debit / $item->purchase_price;
                    } else if ($line->credit > 0) {
                        $qtyChange = -($line->credit / $item->purchase_price);
                    }
                }

                return [
                    'id' => $line->id,
                    'date' => $line->date,
                    'transaction_type' => $line->transaction_type,
                    'reference' => $line->reference,
                    'memo' => $line->memo,
                    'qty_change' => round($qtyChange, 2),
                    'debit' => (float)$line->debit,
                    'credit' => (float)$line->credit,
                ];
            });

        return Inertia::render('Reports/InventoryDetail', [
            'item' => [
                'id' => $item->id,
                'name' => $item->name,
                'sku' => $item->sku,
            ],
            'lines' => $lines,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate
            ]
        ]);
    }
}
