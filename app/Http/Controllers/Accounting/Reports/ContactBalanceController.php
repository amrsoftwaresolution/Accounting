<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Accounting\JournalEntryLine;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ContactBalanceController extends Controller
{
    public function customerBalance(Request $request)
    {
        $endDate = $request->query('end_date');
        $endDate = $endDate !== null && $endDate !== '' ? $endDate : now()->toDateString();

        $customers = Customer::query()->get();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
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
                'balance' => (float) $balance,
            ];
        })->filter(function ($item) {
            return $item['balance'] != 0;
        })->values();

        return Inertia::render('Reports/CustomerBalance', [
            'reportData' => $reportData,
            'filters' => [
                'end_date' => $endDate,
            ],
        ]);
    }

    public function customerBalanceDetailAll(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date', now()->toDateString());

        $customers = Customer::query()->get();

        $query = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.payee_type', Customer::class)
            ->where('chart_of_accs.sub_type', 'accounts-receivable');

        if ($startDate) {
            $query->whereBetween('journal_entries.date', [$startDate, $endDate]);
        } else {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        $allLines = $query->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->select('journal_entry_lines.*', 'journal_entries.date', 'journal_entries.reference', 'journal_entries.transaction_type', 'journal_entries.due_date', 'journal_entries.payee_id')
            ->get()
            ->groupBy('payee_id');

        $reportData = $customers->map(function ($customer) use ($allLines) {
            $lines = $allLines->get($customer->id, collect());
            return [
                'contact' => $customer,
                'lines' => $lines
            ];
        })->filter(function ($group) {
            return $group['lines']->isNotEmpty() || ($group['contact']->opening_balance > 0);
        })->values();

        return Inertia::render('Reports/AllContactBalanceDetail', [
            'reportData' => $reportData,
            'contactType' => 'Customer',
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom'
            ]
        ]);
    }

    public function customerDetail($customerId)
    {
        $details = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.payee_type', Customer::class)
            ->where('journal_entries.payee_id', $customerId)
            ->where('chart_of_accs.sub_type', 'accounts-receivable')
            ->select('journal_entry_lines.*', 'journal_entries.*')
            ->get();

        return Inertia::render('Reports/CustomerDetail', ['details' => $details]);
    }

    public function supplierBalance(Request $request)
    {
        $endDate = $request->query('end_date');
        $endDate = $endDate !== null && $endDate !== '' ? $endDate : now()->toDateString();

        $suppliers = Supplier::query()->get();

        $lines = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
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
            if ($line) {
                $balance += ($line->total_credit - $line->total_debit);
            }

            return [
                'id' => $supplier->id,
                'name' => $supplier->display_name ?: $supplier->company_name,
                'email' => $supplier->email,
                'phone' => $supplier->phone_number,
                'balance' => (float) $balance,
            ];
        })->filter(function ($item) {
            return $item['balance'] != 0;
        })->values();

        return Inertia::render('Reports/SupplierBalance', [
            'reportData' => $reportData,
            'filters' => [
                'end_date' => $endDate,
            ],
        ]);
    }

    public function supplierBalanceDetailAll(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date', now()->toDateString());

        $suppliers = Supplier::query()->get();

        $query = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.payee_type', Supplier::class)
            ->where('chart_of_accs.sub_type', 'accounts-payable');

        if ($startDate) {
            $query->whereBetween('journal_entries.date', [$startDate, $endDate]);
        } else {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        $allLines = $query->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->select('journal_entry_lines.*', 'journal_entries.date', 'journal_entries.reference', 'journal_entries.transaction_type', 'journal_entries.due_date', 'journal_entries.payee_id')
            ->get()
            ->groupBy('payee_id');

        $reportData = $suppliers->map(function ($supplier) use ($allLines) {
            $lines = $allLines->get($supplier->id, collect());
            return [
                'contact' => $supplier,
                'lines' => $lines
            ];
        })->filter(function ($group) {
            return $group['lines']->isNotEmpty() || ($group['contact']->opening_balance > 0);
        })->values();

        return Inertia::render('Reports/AllContactBalanceDetail', [
            'reportData' => $reportData,
            'contactType' => 'Supplier',
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom'
            ]
        ]);
    }

    public function supplierDetail($supplierId)
    {
        $details = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('journal_entries.payee_type', Supplier::class)
            ->where('journal_entries.payee_id', $supplierId)
            ->where('chart_of_accs.sub_type', 'accounts-payable')
            ->select('journal_entry_lines.*', 'journal_entries.*')
            ->get();

        return Inertia::render('Reports/SupplierDetail', ['details' => $details]);
    }
}
