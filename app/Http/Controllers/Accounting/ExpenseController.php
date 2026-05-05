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
            'items.*.category' => 'required',
            'items.*.amount' => 'required',
            'items.*.description' => 'nullable|string',
        ]);

        $journalEntry = DB::transaction(function() use ($request) {
            $totalAmount = collect($request->items)->sum(function($item) {
                return (float) str_replace(',', '', $item['amount']);
            });

            // Resolve payee type
            $payeeId = $request->payee;
            $payeeType = null;
            if (Supplier::find($payeeId)) $payeeType = Supplier::class;
            elseif (Customer::find($payeeId)) $payeeType = Customer::class;
            elseif (Employee::find($payeeId)) $payeeType = Employee::class;

            // 1. Create Journal Entry
            $journalEntry = JournalEntry::create([
                'date' => $request->date,
                'reference' => $request->ref,
                'description' => $request->memo,
                'transaction_type' => 'expense',
                'payee_id' => $payeeId,
                'payee_type' => $payeeType,
                'payment_method_id' => $request->method,
                'total_amount' => $totalAmount,
                'status' => 'posted',
                'created_by' => Auth::id(),
            ]);

            // 2. Create Journal Entry Lines (Debits for Expenses)
            foreach ($request->items as $item) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $item['category'],
                    'debit' => (float) str_replace(',', '', $item['amount']),
                    'credit' => 0,
                    'memo' => $item['description'] ?? $request->memo,
                ]);
            }

            // 3. Create Journal Entry Line (Credit for Payment Account)
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->account,
                'debit' => 0,
                'credit' => $totalAmount,
                'memo' => $request->memo,
            ]);

            return $journalEntry;
        });

        session(['last_update_date' => $request->date]);

        $action = $request->input('action', 'save');
        if ($action === 'close') {
            return redirect()->route('dashboard')->with('success', 'Expense saved successfully.');
        } elseif ($action === 'new') {
            return redirect()->route('expense')->with('success', 'Expense saved successfully.');
        }

        return redirect()->route('expense.edit', $journalEntry->id)->with('success', 'Expense saved successfully.');
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        
        // Transform journal entry into form data structure
        $expenseData = [
            'id' => $journalEntry->id,
            'date' => $journalEntry->date,
            'ref' => $journalEntry->reference,
            'memo' => $journalEntry->description,
            'payee' => $journalEntry->payee_id,
            'method' => $journalEntry->payment_method_id,
            // Payment account is the one with credit > 0
            'account' => $journalEntry->lines->where('credit', '>', 0)->first()?->chart_of_acc_id,
            // Items are those with debit > 0
            'items' => $journalEntry->lines->where('debit', '>', 0)->map(function($line) {
                return [
                    'category' => $line->chart_of_acc_id,
                    'description' => $line->memo,
                    'amount' => $line->debit,
                    'customer' => null, 
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Transaction/ExpenseForm', [
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get(),
            'expense' => $expenseData,
            'lastPaymentDate' => session('last_update_date')
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

            // Resolve payee type
            $payeeId = $request->payee;
            $payeeType = null;
            if (Supplier::find($payeeId)) $payeeType = Supplier::class;
            elseif (Customer::find($payeeId)) $payeeType = Customer::class;
            elseif (Employee::find($payeeId)) $payeeType = Employee::class;

            // 1. Update Journal Entry
            $journalEntry->update([
                'date' => $request->date,
                'reference' => $request->ref,
                'description' => $request->memo,
                'payee_id' => $payeeId,
                'payee_type' => $payeeType,
                'payment_method_id' => $request->method,
                'total_amount' => $totalAmount,
            ]);

            // 2. Delete old lines
            $journalEntry->lines()->delete();

            // 3. Create new lines
            foreach ($request->items as $item) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $item['category'],
                    'debit' => (float) str_replace(',', '', $item['amount']),
                    'credit' => 0,
                    'memo' => $item['description'] ?? $request->memo,
                ]);
            }

            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->account,
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
