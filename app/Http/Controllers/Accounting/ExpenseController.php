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
use App\Http\Requests\Accounting\StoreExpenseRequest;
use App\Http\Requests\Accounting\UpdateExpenseRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/ExpenseForm');
    }

    public function store(StoreExpenseRequest $request)
    {
        $validated = $request->validated();

        $paymentAccount = $request->input('account', $request->input('paymentAccount'));
        $paymentDate = $request->input('date', $request->input('paymentDate'));
        $paymentMethod = $request->input('method', $request->input('paymentMethod'));
        $referenceNo = $request->input('ref', $request->input('referenceNo'));

        $companyId = session('active_company_id');

        try {
            $journalEntry = DB::transaction(function() use ($request, $paymentAccount, $paymentDate, $paymentMethod, $referenceNo, $companyId) {
                $categoryItems = collect($request->items)->filter(function($item) {
                    return !empty($item['category']) && (float)str_replace(',', '', $item['amount']) > 0;
                });
                
                $productItems = collect($request->itemDetails)->filter(function($item) {
                    return !empty($item['product']) && (float)str_replace(',', '', $item['amount']) > 0;
                });

                if ($categoryItems->isEmpty() && $productItems->isEmpty()) {
                    throw new \Exception('At least one Category item or Product item is required.');
                }

                $totalAmount = $categoryItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                }) + $productItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Create Business Document (Expense)
                $expense = \App\Models\Expense::create([
                    'company_id' => $companyId,
                    'payee_id' => $request->payee,
                    'payee_type' => $request->payeeType,
                    'payment_account_id' => $paymentAccount,
                    'payment_date' => $paymentDate,
                    'payment_method_id' => $paymentMethod,
                    'reference_no' => $referenceNo,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'status' => 'posted',
                ]);

                // Categories
                foreach ($categoryItems as $lineItem) {
                    \App\Models\ExpenseItem::create([
                        'expense_id' => $expense->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'description' => $lineItem['description'] ?? '',
                        'quantity' => 1,
                        'rate' => (float) str_replace(',', '', $lineItem['amount']),
                        'amount' => (float) str_replace(',', '', $lineItem['amount']),
                    ]);
                }

                // Products
                foreach ($productItems as $productItem) {
                    $itemModel = \App\Models\Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory' 
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id));
                    
                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id;
                    }

                    \App\Models\ExpenseItem::create([
                        'expense_id' => $expense->id,
                        'item_id' => $productItem['product'],
                        'chart_of_acc_id' => $chartOfAccId,
                        'description' => $productItem['description'] ?? '',
                        'quantity' => (float)str_replace(',', '', $productItem['qty'] ?? 1),
                        'rate' => (float)str_replace(',', '', $productItem['rate'] ?? 0),
                        'amount' => (float)str_replace(',', '', $productItem['amount']),
                    ]);
                }

                // 2. Create Financial Truth (Journal Entry)
                $journalEntry = JournalEntry::create([
                    'company_id' => $companyId,
                    'date' => $paymentDate,
                    'reference' => $referenceNo,
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

                // Debits (Expenses/Assets) - Categories
                foreach ($categoryItems as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => (float) str_replace(',', '', $lineItem['amount']),
                        'credit' => 0,
                        'memo' => $lineItem['description'] ?? $request->memo,
                    ]);
                }

                // Debits (Expenses/Assets) - Products
                foreach ($productItems as $productItem) {
                    $itemModel = \App\Models\Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory' 
                        ? ($itemModel->inventory_account_id ?? ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id)
                        : ($itemModel?->expense_account_id ?? ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id);
                    
                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id;
                    }

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $chartOfAccId,
                        'debit' => (float)str_replace(',', '', $productItem['amount']),
                        'credit' => 0,
                        'memo' => $productItem['description'] ?? $request->memo,
                    ]);
                }

                // Payment Account Credit
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $paymentAccount,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);

                return $journalEntry;
            });

            $action = $request->input('action', 'save');

            // No session saving needed

            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Payment saved successfully.');
            } elseif ($action === 'new') {
                return redirect()->route('expense')->with('success', 'Payment saved successfully.');
            }

            return redirect()->route('expense.edit', $journalEntry->id)->with('success', 'Payment saved successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
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
            'items' => $expense ? $expense->items->whereNull('item_id')->map(function ($item) {
                return [
                    'category' => $item->chart_of_acc_id,
                    'description' => $item->description,
                    'amount' => $item->amount,
                ];
            })->values()->toArray() : [],
            'itemDetails' => $expense ? $expense->items->whereNotNull('item_id')->map(function ($item) {
                return [
                    'product' => $item->item_id,
                    'description' => $item->description,
                    'qty' => $item->quantity ?? 1,
                    'rate' => $item->rate ?? $item->amount,
                    'amount' => $item->amount,
                ];
            })->values()->toArray() : [],
        ];

        $companyId = session('active_company_id');

        $paymentMethods = \App\Models\PaymentMethod::withoutGlobalScopes()
            ->where('is_active', true)
            ->where(function ($query) use ($companyId) {
                $query->whereNull('company_id');

                if ($companyId) {
                    $query->orWhere('company_id', $companyId);
                }
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Transaction/ExpenseForm', [
            'payees' => array_merge(
                Customer::orderBy('display_name')->get()->map(fn($c) => ['id' => $c->id, 'name' => $c->display_name, 'type' => 'customer'])->toArray(),
                Supplier::orderBy('display_name')->get()->map(fn($s) => ['id' => $s->id, 'name' => $s->display_name, 'type' => 'supplier'])->toArray()
            ),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'expense' => $expenseData,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function update(UpdateExpenseRequest $request, JournalEntry $journalEntry)
    {
        $validated = $request->validated();

        $paymentAccount = $request->input('account', $request->input('paymentAccount'));
        $paymentDate = $request->input('date', $request->input('paymentDate'));
        $paymentMethod = $request->input('method', $request->input('paymentMethod'));
        $referenceNo = $request->input('ref', $request->input('referenceNo'));

        $companyId = session('active_company_id');

        try {
            DB::transaction(function() use ($request, $journalEntry, $paymentAccount, $paymentDate, $paymentMethod, $referenceNo, $companyId) {
                $categoryItems = collect($request->items)->filter(function($item) {
                    return !empty($item['category']) && (float)str_replace(',', '', $item['amount']) > 0;
                });
                
                $productItems = collect($request->itemDetails)->filter(function($item) {
                    return !empty($item['product']) && (float)str_replace(',', '', $item['amount']) > 0;
                });

                if ($categoryItems->isEmpty() && $productItems->isEmpty()) {
                    throw new \Exception('At least one Category item or Product item is required.');
                }

                $totalAmount = $categoryItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                }) + $productItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Update Business Document
                $expense = \App\Models\Expense::find($journalEntry->transactionable_id);
                if ($expense) {
                    $expense->update([
                        'payee_id' => $request->payee,
                        'payee_type' => $request->payeeType,
                        'payment_account_id' => $paymentAccount,
                        'payment_date' => $paymentDate,
                        'payment_method_id' => $paymentMethod,
                        'reference_no' => $referenceNo,
                        'total_amount' => $totalAmount,
                        'memo' => $request->memo,
                    ]);

                    $expense->items()->delete();
                    
                    // Categories
                    foreach ($categoryItems as $lineItem) {
                        \App\Models\ExpenseItem::create([
                            'expense_id' => $expense->id,
                            'chart_of_acc_id' => $lineItem['category'],
                            'description' => $lineItem['description'] ?? '',
                            'quantity' => 1,
                            'rate' => (float) str_replace(',', '', $lineItem['amount']),
                            'amount' => (float) str_replace(',', '', $lineItem['amount']),
                        ]);
                    }

                    // Products
                    foreach ($productItems as $productItem) {
                        $itemModel = \App\Models\Item::find($productItem['product']);
                        $chartOfAccId = $itemModel?->type === 'inventory' 
                            ? ($itemModel->inventory_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id))
                            : ($itemModel?->expense_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id));
                        
                        if (!$chartOfAccId) {
                            $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id;
                        }

                        \App\Models\ExpenseItem::create([
                            'expense_id' => $expense->id,
                            'item_id' => $productItem['product'],
                            'chart_of_acc_id' => $chartOfAccId,
                            'description' => $productItem['description'] ?? '',
                            'quantity' => (float)str_replace(',', '', $productItem['qty'] ?? 1),
                            'rate' => (float)str_replace(',', '', $productItem['rate'] ?? 0),
                            'amount' => (float)str_replace(',', '', $productItem['amount']),
                        ]);
                    }
                }

                // 2. Update Financial Truth
                $journalEntry->update([
                    'date' => $paymentDate,
                    'reference' => $referenceNo,
                    'description' => $request->memo,
                    'payee_id' => $request->payee,
                    'payee_type' => $request->payeeType == 'customer' ? Customer::class : (\App\Models\Supplier::class),
                    'total_amount' => $totalAmount,
                ]);

                $journalEntry->lines->each->delete();

                // Debits (Expenses/Assets) - Categories
                foreach ($categoryItems as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => (float) str_replace(',', '', $lineItem['amount']),
                        'credit' => 0,
                        'memo' => $lineItem['description'] ?? $request->memo,
                    ]);
                }

                // Debits (Expenses/Assets) - Products
                foreach ($productItems as $productItem) {
                    $itemModel = \App\Models\Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory' 
                        ? ($itemModel->inventory_account_id ?? ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id)
                        : ($itemModel?->expense_account_id ?? ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id);
                    
                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id;
                    }

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $chartOfAccId,
                        'debit' => (float)str_replace(',', '', $productItem['amount']),
                        'credit' => 0,
                        'memo' => $productItem['description'] ?? $request->memo,
                    ]);
                }

                // Credit
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $paymentAccount,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);
            });

            $action = $request->input('action', 'save');
            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Expense updated successfully.');
            } elseif ($action === 'new') {
                return redirect()->route('expense')->with('success', 'Expense updated successfully.');
            }

            return redirect()->back()->with('success', 'Expense updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
