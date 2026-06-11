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
use App\Http\Requests\Accounting\StoreBillRequest;
use App\Http\Requests\Accounting\UpdateBillRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    public function create(Request $request)
    {
        $companyId = session('active_company_id');

        // Generate next Bill Number
        $lastRef = JournalEntry::where('company_id', $companyId)
            ->where('transaction_type', 'bill')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->value('reference');

        $nextBillNo = is_numeric($lastRef) ? (int)$lastRef + 1 : 1001;
        $nextBillNoLabel = (string)str_pad($nextBillNo, 4, '0', STR_PAD_LEFT);

        if ($copyId = $request->query('copy')) {
            $journalEntry = JournalEntry::findOrFail($copyId);
            $journalEntry->load('lines');
            $bill = \App\Models\Bill::find($journalEntry->transactionable_id);

            $billData = [
                'id' => null,
                'supplier' => $bill?->supplier_id ?? $journalEntry->payee_id,
                'mailingAddress' => '',
                'terms' => $bill?->terms ?? 'Net 30',
                'billDate' => $journalEntry->date,
                'dueDate' => $bill?->due_date ?? $journalEntry->due_date,
                'billNo' => $nextBillNoLabel,
                'memo' => $journalEntry->description,
                'items' => $bill ? $bill->items->whereNull('item_id')->map(function ($item) {
                    return [
                        'category' => $item->chart_of_acc_id,
                        'description' => $item->description,
                        'amount' => $item->amount,
                    ];
                })->values()->toArray() : [],
                'itemDetails' => $bill ? $bill->items->whereNotNull('item_id')->map(function ($item) {
                    return [
                        'product' => $item->item_id,
                        'description' => $item->description,
                        'qty' => $item->quantity ?? 1,
                        'rate' => $item->rate ?? $item->amount,
                        'amount' => $item->amount,
                    ];
                })->values()->toArray() : [],
            ];

            return Inertia::render('Transaction/BillForm', [
                'bill' => $billData,
                'nextBillNo' => $nextBillNoLabel,
            ]);
        }

        return Inertia::render('Transaction/BillForm', [
            'nextBillNo' => $nextBillNoLabel
        ]);
    }

    public function store(StoreBillRequest $request)
    {
        $request->validated();

        try {
            $journalEntry = DB::transaction(function() use ($request) {
                $companyId = session('active_company_id');

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
                    return (float)str_replace(',', '', $item['amount']);
                }) + $productItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
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

                // 2. Create Bill Items (Categories)
                foreach ($categoryItems as $lineItem) {
                    $amount = (float)str_replace(',', '', $lineItem['amount']);
                    BillItem::create([
                        'bill_id' => $bill->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'description' => $lineItem['description'] ?? '',
                        'amount' => $amount,
                        'quantity' => 1,
                        'rate' => $amount,
                    ]);
                }

                // Create Bill Items (Products)
                foreach ($productItems as $productItem) {
                    $itemModel = \App\Models\Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory'
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id;
                    }

                    BillItem::create([
                        'bill_id' => $bill->id,
                        'item_id' => $productItem['product'],
                        'chart_of_acc_id' => $chartOfAccId,
                        'description' => $productItem['description'] ?? '',
                        'quantity' => (float)str_replace(',', '', $productItem['qty'] ?? 1),
                        'rate' => (float)str_replace(',', '', $productItem['rate'] ?? 0),
                        'amount' => (float)str_replace(',', '', $productItem['amount']),
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

                // Debits (Expenses/Assets) - Categories
                foreach ($categoryItems as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => (float)str_replace(',', '', $lineItem['amount']),
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

                // Credit (Accounts Payable)
                $apAccount = ChartOfAcc::getOrCreateDefault('accounts-payable', $companyId);

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);

                return $journalEntry;
            });

            $action = $request->input('action', 'save');

            if ($action === 'close') {
                return redirect()->back()->with('success', 'Bill saved successfully.');
            }

            if ($action === 'new') {
                return redirect()->route('bill')->with('success', 'Bill saved successfully.');
            }

            return response()->json([
                'message' => 'Bill saved successfully.',
                'id' => $journalEntry->id,
            ]);

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
            'terms' => $bill?->terms ?? 'Net 30',
            'billDate' => $journalEntry->date,
            'dueDate' => $bill?->due_date ?? $journalEntry->due_date,
            'billNo' => $journalEntry->reference,
            'memo' => $journalEntry->description,
            'items' => $bill ? $bill->items->whereNull('item_id')->map(function ($item) {
                return [
                    'category' => $item->chart_of_acc_id,
                    'description' => $item->description,
                    'amount' => $item->amount,
                ];
            })->values()->toArray() : [],
            'itemDetails' => $bill ? $bill->items->whereNotNull('item_id')->map(function ($item) {
                return [
                    'product' => $item->item_id,
                    'description' => $item->description,
                    'qty' => $item->quantity ?? 1,
                    'rate' => $item->rate ?? $item->amount,
                    'amount' => $item->amount,
                ];
            })->values()->toArray() : [],
        ];

        return Inertia::render('Transaction/BillForm', [
            'bill' => $billData
        ]);
    }

    public function update(UpdateBillRequest $request, JournalEntry $journalEntry)
    {
        $request->validated();

        try {
            DB::transaction(function() use ($request, $journalEntry) {
                $companyId = session('active_company_id');

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
                    return (float)str_replace(',', '', $item['amount']);
                }) + $productItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
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

                    // Categories
                    foreach ($categoryItems as $lineItem) {
                        $amount = (float)str_replace(',', '', $lineItem['amount']);
                        BillItem::create([
                            'bill_id' => $bill->id,
                            'chart_of_acc_id' => $lineItem['category'],
                            'description' => $lineItem['description'] ?? '',
                            'amount' => $amount,
                            'quantity' => 1,
                            'rate' => $amount,
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

                        BillItem::create([
                            'bill_id' => $bill->id,
                            'item_id' => $productItem['product'],
                            'chart_of_acc_id' => $chartOfAccId,
                            'description' => $productItem['description'] ?? '',
                            'quantity' => (float)str_replace(',', '', $productItem['qty'] ?? 1),
                            'rate' => (float)str_replace(',', '', $productItem['rate'] ?? 0),
                            'amount' => (float)str_replace(',', '', $productItem['amount']),
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

                $journalEntry->lines->each->delete();

                // Debits (Expenses/Assets) - Categories
                foreach ($categoryItems as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => (float)str_replace(',', '', $lineItem['amount']),
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

                // Credit (Accounts Payable)
                $apAccount = ChartOfAcc::getOrCreateDefault('accounts-payable', $companyId);

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

    public function destroy(JournalEntry $journalEntry)
    {
        $chartOfAccountId = $journalEntry->lines->first()?->chart_of_acc_id 
            ?? $journalEntry->lines->first()?->chart_of_account_id 
            ?? $journalEntry->lines->first()?->account_id;

        DB::transaction(function () use ($journalEntry) {
            $bill = Bill::find($journalEntry->transactionable_id);

            if ($bill) {
                $bill->items()->delete();
                $bill->delete();
            }

            $journalEntry->lines->each->delete();
            $journalEntry->delete();
        });

        if ($chartOfAccountId) {
            return redirect()->route('chart-of-account.history', ['chart_of_account' => $chartOfAccountId])
                ->with('success', 'Bill deleted successfully.');
        }

        return redirect()->route('chart-of-account.index')
            ->with('success', 'Bill deleted successfully.');
    }
}

