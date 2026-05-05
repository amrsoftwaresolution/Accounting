<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    public function create()
    {
        $suppliers = Supplier::orderBy('display_name')->get();
        $accounts = ChartOfAcc::orderBy('account_code')->get();
        
        // Get the last numeric reference for 'bill' and increment it
        $lastRef = JournalEntry::where('transaction_type', 'bill')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->value('reference');
            
        $nextBillNo = is_numeric($lastRef) ? (int)$lastRef + 1 : 1001;

        return Inertia::render('Transaction/BillForm', [
            'suppliers' => $suppliers,
            'accounts' => $accounts,
            'nextBillNo' => (string)str_pad($nextBillNo, 4, '0', STR_PAD_LEFT)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier' => 'required',
            'billDate' => 'required|date',
            'billNo' => 'required',
            'items' => 'required|array|min:1',
        ]);

        DB::transaction(function() use ($request) {
            $totalAmount = collect($request->items)->sum(function($item) {
                return (float) str_replace(',', '', $item['amount']);
            });

            // 1. Create Business Document (Bill)
            $bill = \App\Models\Bill::create([
                'company_id' => session('active_company_id'),
                'supplier_id' => $request->supplier,
                'email' => $request->email,
                'bill_date' => $request->billDate,
                'due_date' => $request->dueDate,
                'bill_no' => $request->billNo,
                'total_amount' => $totalAmount,
                'memo' => $request->memo,
                'status' => 'posted',
            ]);

            foreach ($request->items as $lineItem) {
                \App\Models\BillItem::create([
                    'bill_id' => $bill->id,
                    'chart_of_acc_id' => $lineItem['category'],
                    'description' => $lineItem['description'] ?? '',
                    'amount' => (float) str_replace(',', '', $lineItem['amount']),
                ]);
            }

            // 2. Create Financial Truth (Journal Entry)
            $journalEntry = JournalEntry::create([
                'date' => $request->billDate,
                'due_date' => $request->dueDate,
                'reference' => $request->billNo,
                'description' => $request->memo,
                'transaction_type' => 'bill',
                'payee_id' => $request->supplier,
                'payee_type' => \App\Models\Supplier::class,
                'total_amount' => $totalAmount,
                'status' => 'posted',
                'created_by' => Auth::id(),
                'transactionable_id' => $bill->id,
                'transactionable_type' => \App\Models\Bill::class,
            ]);

            // Bill Debits (Expenses/Assets)
            foreach ($request->items as $lineItem) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $lineItem['category'],
                    'debit' => (float) str_replace(',', '', $lineItem['amount']),
                    'credit' => 0,
                    'memo' => $lineItem['description'] ?? $request->memo,
                ]);
            }

            // Accounts Payable (Credit)
            $apAccount = ChartOfAcc::where('sub_type', 'accounts-payable')->first();
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $apAccount->id,
                'debit' => 0,
                'credit' => $totalAmount,
                'memo' => $request->memo,
            ]);
        });

        return redirect()->back()->with('success', 'Bill saved successfully.');
    }
}
