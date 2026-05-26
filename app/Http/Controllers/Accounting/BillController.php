<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use App\Models\Bill;
use App\Models\BillItem;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    public function create()
    {
        $companyId = session('active_company_id');

        // Generate next Bill Number
        $lastRef = JournalEntry::where('company_id', $companyId)
            ->where('transaction_type', 'bill')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->value('reference');

        $nextBillNo = is_numeric($lastRef) ? (int)$lastRef + 1 : 1001;

        return Inertia::render('Transaction/BillForm', [
            'nextBillNo' => (string)str_pad($nextBillNo, 4, '0', STR_PAD_LEFT),
            'lastBillDate' => session('last_bill_date'),
            'lastDueDate' => session('last_due_date_bill'),
            'lastSaveAction' => session('last_save_action_bill', 'save'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier' => 'required',
            'billDate' => 'required|date',
            'billNo' => 'required',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required',
            'items.*.amount' => 'required|numeric',
        ]);

        try {
            DB::transaction(function() use ($request) {
                $companyId = session('active_company_id');

                $totalAmount = collect($request->items)->sum(function($item) {
                    return (float) $item['amount'];
                });

                // 1. Create the Bill
                $bill = Bill::create([
                    'company_id' => $companyId,
                    'supplier_id' => $request->supplier,
                    'bill_date' => $request->billDate,
                    'due_date' => $request->dueDate,
                    'bill_no' => $request->billNo,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'status' => 'posted',
                ]);

                // 2. Create Bill Items
                foreach ($request->items as $lineItem) {
                    BillItem::create([
                        'bill_id' => $bill->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'description' => $lineItem['description'] ?? '',
                        'amount' => $lineItem['amount'],
                    ]);
                }

                // 3. Create the Journal Entry
                $journalEntry = JournalEntry::create([
                    'company_id' => $companyId,
                    'date' => $request->billDate,
                    'reference' => $request->billNo,
                    'description' => $request->memo,
                    'transaction_type' => 'bill',
                    'payee_id' => $request->supplier,
                    'payee_type' => Supplier::class,
                    'total_amount' => $totalAmount,
                    'status' => 'posted',
                    'created_by' => Auth::id(),
                    'transactionable_id' => $bill->id,
                    'transactionable_type' => Bill::class,
                ]);

                // Debits (Expenses)
                foreach ($request->items as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => $lineItem['amount'],
                        'credit' => 0,
                        'memo' => $lineItem['description'] ?? $request->memo,
                    ]);
                }

                // Credit (Accounts Payable)
                $apAccount = ChartOfAcc::where('company_id', $companyId)
                    ->where('sub_type', 'accounts-payable')
                    ->first();

                if (!$apAccount) {
                    throw new \Exception("Accounts Payable account not found.");
                }

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);
            });

            $action = $request->input('action', 'save');

            // Save to session
            session([
                'last_bill_date' => $request->billDate, 
                'last_due_date_bill' => $request->dueDate, 
                'last_save_action_bill' => $action
            ]);

            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Bill saved successfully.');
            } elseif ($action === 'new') {
                return redirect()->route('bill.create')->with('success', 'Bill saved successfully.');
            }

            return redirect()->back()->with('success', 'Bill saved successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $bill = \App\Models\Bill::find($journalEntry->transactionable_id);

        $billData = [
            'id' => $journalEntry->id,
            'supplier' => $bill?->supplier_id ?? $journalEntry->payee_id,
            'mailingAddress' => '',
            'terms' => 'Net 30',
            'billDate' => $journalEntry->date,
            'dueDate' => $bill?->due_date ?? $journalEntry->due_date,
            'billNo' => $journalEntry->reference,
            'memo' => $journalEntry->description,
            'items' => $journalEntry->lines->where('debit', '>', 0)->map(function ($line) {
                return [
                    'category' => $line->chart_of_acc_id,
                    'description' => $line->memo,
                    'amount' => $line->debit,
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Transaction/BillForm', [
            'bill' => $billData,
            'lastBillDate' => session('last_bill_date'),
            'lastDueDate' => session('last_due_date_bill'),
            'lastSaveAction' => session('last_save_action_bill', 'save'),
        ]);
    }

    public function update(Request $request, JournalEntry $journalEntry)
    {
        $request->validate([
            'supplier' => 'required',
            'billDate' => 'required|date',
            'billNo' => 'required',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required',
            'items.*.amount' => 'required|numeric',
        ]);

        try {
            DB::transaction(function() use ($request, $journalEntry) {
                $companyId = session('active_company_id');

                $totalAmount = collect($request->items)->sum(function($item) {
                    return (float) $item['amount'];
                });

                // 1. Update the Bill
                $bill = Bill::find($journalEntry->transactionable_id);
                if ($bill) {
                    $bill->update([
                        'supplier_id' => $request->supplier,
                        'bill_date' => $request->billDate,
                        'due_date' => $request->dueDate,
                        'bill_no' => $request->billNo,
                        'total_amount' => $totalAmount,
                        'memo' => $request->memo,
                    ]);

                    $bill->items()->delete();
                    foreach ($request->items as $lineItem) {
                        BillItem::create([
                            'bill_id' => $bill->id,
                            'chart_of_acc_id' => $lineItem['category'],
                            'description' => $lineItem['description'] ?? '',
                            'amount' => $lineItem['amount'],
                        ]);
                    }
                }

                // 2. Update the Journal Entry
                $journalEntry->update([
                    'date' => $request->billDate,
                    'reference' => $request->billNo,
                    'description' => $request->memo,
                    'payee_id' => $request->supplier,
                    'total_amount' => $totalAmount,
                ]);

                $journalEntry->lines()->delete();

                // Debits (Expenses)
                foreach ($request->items as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => $lineItem['amount'],
                        'credit' => 0,
                        'memo' => $lineItem['description'] ?? $request->memo,
                    ]);
                }

                // Credit (Accounts Payable)
                $apAccount = ChartOfAcc::where('company_id', $companyId)
                    ->where('sub_type', 'accounts-payable')
                    ->first();

                if (!$apAccount) {
                    throw new \Exception("Accounts Payable account not found.");
                }

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);
            });

            $action = $request->input('action', 'save');
            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Bill updated successfully.');
            }

            return redirect()->back()->with('success', 'Bill updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
