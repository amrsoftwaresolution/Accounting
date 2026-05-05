<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/ExpenseForm', [
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get(),
            'lastPaymentDate' => session('last_update_date')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payee' => 'required',
            'account' => 'required',
            'date' => 'required|date',
            'method' => 'required',
            'ref' => 'nullable|string',
            'memo' => 'nullable|string',
            'items' => 'required|array|min:1',
            'paymentAccount' => 'required',
            'paymentDate' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required',
            'items.*.amount' => 'required',
        ]);

        $journalEntry = DB::transaction(function() use ($request) {
            $totalAmount = collect($request->items)->sum(function($item) {
                return (float) str_replace(',', '', $item['amount']);
            });

            // 1. Create Business Document (Expense)
            $expense = \App\Models\Expense::create([
                'company_id' => session('active_company_id'),
                'payee_id' => $request->payee,
                'payee_type' => $request->payeeType, // Handled in frontend
                'payment_account_id' => $request->paymentAccount,
                'payment_date' => $request->paymentDate,
                'payment_method_id' => $request->paymentMethod,
                'reference_no' => $request->referenceNo,
                'total_amount' => $totalAmount,
                'memo' => $request->memo,
                'status' => 'posted',
            ]);

            foreach ($request->items as $lineItem) {
                \App\Models\ExpenseItem::create([
                    'expense_id' => $expense->id,
                    'chart_of_acc_id' => $lineItem['category'],
                    'description' => $lineItem['description'] ?? '',
                    'amount' => (float) str_replace(',', '', $lineItem['amount']),
                ]);
            }

            // 2. Create Financial Truth (Journal Entry)
            $journalEntry = JournalEntry::create([
                'date' => $request->paymentDate,
                'reference' => $request->referenceNo,
                'description' => $request->memo,
                'transaction_type' => 'expense',
                'payee_id' => $request->payee,
                'payee_type' => $request->payeeType == 'customer' ? Customer::class : (\App\Models\Supplier::class),
                'total_amount' => $totalAmount,
                'status' => 'posted',
                'created_by' => Auth::id(),
                'transactionable_id' => $expense->id,
                'transactionable_type' => \App\Models\Expense::class,
            ]);

            // Expense Debits
            foreach ($request->items as $lineItem) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $lineItem['category'],
                    'debit' => (float) str_replace(',', '', $lineItem['amount']),
                    'credit' => 0,
                    'memo' => $lineItem['description'] ?? $request->memo,
                ]);
            }

            // Payment Account Credit
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->paymentAccount,
                'debit' => 0,
                'credit' => $totalAmount,
                'memo' => $request->memo,
            ]);

            return $journalEntry;
        });

        $action = $request->input('action', 'save');
        if ($action === 'close') {
            return redirect()->route('dashboard')->with('success', 'Expense saved successfully.');
        } elseif ($action === 'new') {
            return redirect()->route('expense')->with('success', 'Expense saved successfully.');
        }

        return redirect()->back()->with('success', 'Expense saved successfully.');
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $expense = \App\Models\Expense::find($journalEntry->transactionable_id);

        $expenseData = [
            'id' => $journalEntry->id,
            'payee' => $journalEntry->payee_id,
            'payeeType' => $expense?->payee_type ?? ($journalEntry->payee_type == Customer::class ? 'customer' : 'supplier'),
            'paymentAccount' => $expense?->payment_account_id ?? $journalEntry->lines->where('credit', '>', 0)->first()?->chart_of_acc_id,
            'paymentDate' => $journalEntry->date,
            'paymentMethod' => $expense?->payment_method_id ?? '',
            'referenceNo' => $journalEntry->reference,
            'memo' => $journalEntry->description,
            'items' => $journalEntry->lines->where('debit', '>', 0)->map(function($line) {
                return [
                    'category' => $line->chart_of_acc_id,
                    'description' => $line->memo,
                    'amount' => $line->debit,
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Transaction/ExpenseForm', [
            'payees' => array_merge(
                Customer::orderBy('display_name')->get()->map(fn($c) => ['id' => $c->id, 'name' => $c->display_name, 'type' => 'customer'])->toArray(),
                Supplier::orderBy('name')->get()->map(fn($s) => ['id' => $s->id, 'name' => $s->name, 'type' => 'supplier'])->toArray()
            ),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'expense' => $expenseData,
            'paymentMethods' => \App\Models\PaymentMethod::all(),
        ]);
    }

    public function update(Request $request, JournalEntry $journalEntry)
    {
        $validated = $request->validate([
            'payee' => 'required',
            'account' => 'required',
            'date' => 'required|date',
            'method' => 'required',
            'ref' => 'nullable|string',
            'memo' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required',
            'items.*.amount' => 'required',
            'items.*.description' => 'nullable|string',
        ]);

        DB::transaction(function() use ($request, $journalEntry) {
            $totalAmount = collect($request->items)->sum(function($item) {
                return (float) str_replace(',', '', $item['amount']);
            });

            // 1. Update Business Document
            $expense = \App\Models\Expense::find($journalEntry->transactionable_id);
            if ($expense) {
                $expense->update([
                    'payee_id' => $request->payee,
                    'payee_type' => $request->payeeType,
                    'payment_account_id' => $request->paymentAccount,
                    'payment_date' => $request->paymentDate,
                    'payment_method_id' => $request->paymentMethod,
                    'reference_no' => $request->referenceNo,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                ]);

                $expense->items()->delete();
                foreach ($request->items as $lineItem) {
                    \App\Models\ExpenseItem::create([
                        'expense_id' => $expense->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'description' => $lineItem['description'] ?? '',
                        'amount' => (float) str_replace(',', '', $lineItem['amount']),
                    ]);
                }
            }

            // 2. Update Financial Truth
            $journalEntry->update([
                'date' => $request->paymentDate,
                'reference' => $request->referenceNo,
                'description' => $request->memo,
                'payee_id' => $request->payee,
                'payee_type' => $request->payeeType == 'customer' ? Customer::class : (\App\Models\Supplier::class),
                'total_amount' => $totalAmount,
            ]);

            $journalEntry->lines()->delete();

            foreach ($request->items as $lineItem) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $lineItem['category'],
                    'debit' => (float) str_replace(',', '', $lineItem['amount']),
                    'credit' => 0,
                    'memo' => $lineItem['description'] ?? $request->memo,
                ]);
            }

            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->paymentAccount,
                'debit' => 0,
                'credit' => $totalAmount,
                'memo' => $request->memo,
            ]);
        });

        $action = $request->input('action', 'save');
        if ($action === 'close') {
            return redirect()->route('dashboard')->with('success', 'Expense updated successfully.');
        }

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }
}
