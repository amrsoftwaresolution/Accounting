<?php

namespace App\Services\Reports;

use App\Models\Accounting\ChartOfAcc;
use Illuminate\Support\Facades\DB;

class AccountTreeBuilder
{
    public function buildAccountTree($types, $lines, $isBalanceSheet = false)
    {
        $allAccounts = ChartOfAcc::query()
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
        foreach ($accountBalances as $id => &$node) {
            if ($node['parent_id'] && isset($accountBalances[$node['parent_id']])) {
                $accountBalances[$node['parent_id']]['children'][] = &$node;
            } else {
                $tree[] = &$node;
            }
        }

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

    public function buildBalanceSheetTree($types, $lines, $displayBy, $months)
    {
        $allAccounts = ChartOfAcc::query()
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
                $runningBalance = 0;
                foreach ($months as $month) {
                    $monthLine = $accountLines->firstWhere('month', $month);
                    $debit = $monthLine ? $monthLine->total_debit : 0;
                    $credit = $monthLine ? $monthLine->total_credit : 0;

                    if ($type === 'income' || $type === 'liability' || $type === 'equity') {
                        $runningBalance += ($credit - $debit);
                    } else {
                        $runningBalance += ($debit - $credit);
                    }

                    $monthly_balances[$month] = (float) $runningBalance;
                }
                $total_balance = $runningBalance;
            } else {
                $line = $accountLines->first();
                $debit = $line ? $line->total_debit : 0;
                $credit = $line ? $line->total_credit : 0;
                if ($type === 'income' || $type === 'liability' || $type === 'equity') {
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
        return collect($tree)->groupBy('account_type');
    }

    public function buildPnLTree($types, $lines, $displayBy, $months)
    {
        $allAccounts = ChartOfAcc::query()
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
}
