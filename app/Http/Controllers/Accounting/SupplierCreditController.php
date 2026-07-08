<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\SupplierCreditNote;
use App\Models\SupplierCreditNoteItem;
use App\Models\Supplier;
use App\Models\ChartOfAcc;
use App\Models\Item;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Accounting\StoreSupplierCreditRequest;
use App\Http\Requests\Accounting\UpdateSupplierCreditRequest;

class SupplierCreditController extends Controller
{
    public function index()
    {
        return Inertia::render('Transaction/SupplierCredit', [
            'credits' => SupplierCreditNote::with('supplier')
                ->where('company_id', session('active_company_id'))
                ->latest()
                ->get(),
            // Added this so the dropdown isn't empty on the index/list page if needed
            'suppliers' => Supplier::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('name')->get(),
        ]);
    }

    public function create(Request $request)
    {
        if ($copyId = $request->query('copy')) {
            $journalEntry = JournalEntry::findOrFail($copyId);
            $creditNote = SupplierCreditNote::find($journalEntry->transactionable_id);

            if (!$creditNote) {
                abort(404, 'Supplier Return not found');
            }

            $creditNote->load('items');

            $creditNoteData = [
                'id' => null,
                'supplier' => $creditNote->supplier_id,
                'creditDate' => $creditNote->credit_date,
                'creditNo' => (string)$this->getNextNo(),
                'memo' => $creditNote->memo,
                'items' => $creditNote->items->whereNull('item_id')->map(function ($item) {
                    return [
                        'category' => $item->chart_of_acc_id,
                        'description' => $item->description,
                        'amount' => number_format($item->amount, 2, '.', ''),
                    ];
                })->values()->toArray(),
                'itemDetails' => $creditNote->items->whereNotNull('item_id')->map(function ($item) {
                    return [
                        'product' => $item->item_id,
                        'description' => $item->description,
                        'qty' => $item->quantity,
                        'rate' => number_format($item->rate, 2, '.', ''),
                        'amount' => number_format($item->amount, 2, '.', ''),
                    ];
                })->values()->toArray(),
            ];

            return Inertia::render('Transaction/SupplierCreditForm', [
                'credit' => $creditNoteData,
                'nextCreditNo' => (string)$this->getNextNo(),
            ]);
        }

        return Inertia::render('Transaction/SupplierCreditForm', [
            'nextCreditNo' => (string)$this->getNextNo()
        ]);
    }

    public function store(StoreSupplierCreditRequest $request)
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
                    return (float) str_replace(',', '', $item['amount']);
                }) + $productItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Create Credit Note
                $creditNote = SupplierCreditNote::create([
                    'company_id' => $companyId,
                    'supplier_id' => $request->supplier,
                    'credit_date' => $request->creditDate,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'status' => 'posted',
                ]);

                // Create Credit Note Items (Categories)
                foreach ($categoryItems as $lineItem) {
                    SupplierCreditNoteItem::create([
                        'supplier_credit_note_id' => $creditNote->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'description' => $lineItem['description'] ?? '',
                        'quantity' => 1,
                        'rate' => (float) str_replace(',', '', $lineItem['amount']),
                        'amount' => (float) str_replace(',', '', $lineItem['amount']),
                    ]);
                }

                // Create Credit Note Items (Products)
                foreach ($productItems as $productItem) {
                    $itemModel = Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory'
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id;
                    }

                    SupplierCreditNoteItem::create([
                        'supplier_credit_note_id' => $creditNote->id,
                        'item_id' => $productItem['product'],
                        'chart_of_acc_id' => $chartOfAccId,
                        'description' => $productItem['description'] ?? '',
                        'quantity' => (float)str_replace(',', '', $productItem['qty'] ?? 1),
                        'rate' => (float)str_replace(',', '', $productItem['rate'] ?? 0),
                        'amount' => (float)str_replace(',', '', $productItem['amount']),
                    ]);
                }

                // 2. Financial Entry
                $journalEntry = JournalEntry::create([
                    'company_id' => $companyId,
                    'date' => $request->creditDate,
                    'reference' => $request->creditNo,
                    'description' => $request->memo,
                    'transaction_type' => 'supplier_credit',
                    'payee_id' => $request->supplier,
                    'payee_type' => Supplier::class,
                    'total_amount' => $totalAmount,
                    'status' => 'posted',
                    'created_by' => Auth::id(),
                    'transactionable_id' => $creditNote->id,
                    'transactionable_type' => SupplierCreditNote::class,
                ]);

                // Debit Accounts Payable (Reducing what we owe)
                $apAccount = ChartOfAcc::getOrCreateDefault('accounts-payable', $companyId);

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id,
                    'debit' => $totalAmount,
                    'credit' => 0,
                    'memo' => $request->memo,
                ]);

                // Credit Expense/Inventory - Categories
                foreach ($categoryItems as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $lineItem['amount']),
                        'memo' => $lineItem['description'] ?? $request->memo,
                    ]);
                }

                // Credit Expense/Inventory - Products
                foreach ($productItems as $productItem) {
                    $itemModel = Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory'
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id;
                    }

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $chartOfAccId,
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $productItem['amount']),
                        'memo' => $productItem['description'] ?? $request->memo,
                    ]);
                }

                return $journalEntry;
            });

            $action = $request->input('action', 'save');

            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Supplier Return saved successfully.');
            }

            if ($action === 'new') {
                return redirect()->route('supplier-credit')->with('success', 'Supplier Return saved successfully.');
            }

            return redirect()->route('supplier-credit.edit', $journalEntry->id)->with('success', 'Supplier Return saved successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $creditNote = SupplierCreditNote::find($journalEntry->transactionable_id);

        if (!$creditNote) {
            abort(404, 'Supplier Return not found');
        }

        $creditNote->load('items');

        $creditNoteData = [
            'id' => $journalEntry->id,
            'supplier' => $creditNote->supplier_id,
            'creditDate' => $creditNote->credit_date,
            'creditNo' => $journalEntry->reference,
            'memo' => $creditNote->memo,
            'items' => $creditNote->items->whereNull('item_id')->map(function ($item) {
                return [
                    'category' => $item->chart_of_acc_id,
                    'description' => $item->description,
                    'amount' => number_format($item->amount, 2, '.', ''),
                ];
            })->values()->toArray(),
            'itemDetails' => $creditNote->items->whereNotNull('item_id')->map(function ($item) {
                return [
                    'product' => $item->item_id,
                    'description' => $item->description,
                    'qty' => $item->quantity,
                    'rate' => number_format($item->rate, 2, '.', ''),
                    'amount' => number_format($item->amount, 2, '.', ''),
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Transaction/SupplierCreditForm', [
            'credit' => $creditNoteData,
            'nextCreditNo' => $this->getNextNo()
        ]);
    }

    public function update(UpdateSupplierCreditRequest $request, JournalEntry $journalEntry)
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
                    return (float) str_replace(',', '', $item['amount']);
                }) + $productItems->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Update Credit Note
                $creditNote = SupplierCreditNote::findOrFail($journalEntry->transactionable_id);
                $creditNote->update([
                    'supplier_id' => $request->supplier,
                    'credit_date' => $request->creditDate,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                ]);

                // Recreate Items
                $creditNote->items()->delete();

                // Create Credit Note Items (Categories)
                foreach ($categoryItems as $lineItem) {
                    SupplierCreditNoteItem::create([
                        'supplier_credit_note_id' => $creditNote->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'description' => $lineItem['description'] ?? '',
                        'quantity' => 1,
                        'rate' => (float) str_replace(',', '', $lineItem['amount']),
                        'amount' => (float) str_replace(',', '', $lineItem['amount']),
                    ]);
                }

                // Create Credit Note Items (Products)
                foreach ($productItems as $productItem) {
                    $itemModel = Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory'
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id;
                    }

                    SupplierCreditNoteItem::create([
                        'supplier_credit_note_id' => $creditNote->id,
                        'item_id' => $productItem['product'],
                        'chart_of_acc_id' => $chartOfAccId,
                        'description' => $productItem['description'] ?? '',
                        'quantity' => (float)str_replace(',', '', $productItem['qty'] ?? 1),
                        'rate' => (float)str_replace(',', '', $productItem['rate'] ?? 0),
                        'amount' => (float)str_replace(',', '', $productItem['amount']),
                    ]);
                }

                // 2. Update Financial Entry
                $journalEntry->update([
                    'date' => $request->creditDate,
                    'reference' => $request->creditNo,
                    'description' => $request->memo,
                    'payee_id' => $request->supplier,
                    'total_amount' => $totalAmount,
                ]);

                $journalEntry->lines->each->delete();

                // Debit Accounts Payable (Reducing what we owe)
                $apAccount = ChartOfAcc::getOrCreateDefault('accounts-payable', $companyId);

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id,
                    'debit' => $totalAmount,
                    'credit' => 0,
                    'memo' => $request->memo,
                ]);

                // Credit Expense/Inventory - Categories
                foreach ($categoryItems as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $lineItem['amount']),
                        'memo' => $lineItem['description'] ?? $request->memo,
                    ]);
                }

                // Credit Expense/Inventory - Products
                foreach ($productItems as $productItem) {
                    $itemModel = Item::find($productItem['product']);
                    $chartOfAccId = $itemModel?->type === 'inventory'
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::where('company_id', $companyId)->where('account_type', 'expense')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId)->id;
                    }

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $chartOfAccId,
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $productItem['amount']),
                        'memo' => $productItem['description'] ?? $request->memo,
                    ]);
                }
            });

            $action = $request->input('action', 'save');

            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Supplier Return updated successfully.');
            }

            if ($action === 'new') {
                return redirect()->route('supplier-credit')->with('success', 'Supplier Return updated successfully.');
            }

            return redirect()->route('supplier-credit.edit', $journalEntry->id)->with('success', 'Supplier Return updated successfully.');
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
            $creditNote = SupplierCreditNote::find($journalEntry->transactionable_id);

            if ($creditNote) {
                $creditNote->items()->delete();
                $creditNote->delete();
            }

            $journalEntry->lines->each->delete();
            $journalEntry->delete();
        });
        if ($chartOfAccountId) {
            return redirect()->route('chart-of-account.history', ['chart_of_account' => $chartOfAccountId])
                ->with('success', 'Supplier Return deleted successfully.');
        }

        return redirect()->route('chart-of-account.index')
            ->with('success', 'Supplier Return deleted successfully.');
    }

    private function getNextNo()
    {
        $last = SupplierCreditNote::where('company_id', session('active_company_id'))->latest()->first();
        return $last ? (int)filter_var($last->id, FILTER_SANITIZE_NUMBER_INT) + 1 : 1001;
    }
}
