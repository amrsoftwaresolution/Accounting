<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\SupplierInvoiceReturn;
use App\Models\SupplierInvoiceReturnItem;
use App\Models\Supplier;
use App\Models\ChartOfAcc;
use App\Models\Item;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Accounting\BillReturnRequest;

class BillReturnController extends Controller
{
    public function index()
    {
        return Inertia::render('Transaction/SupplierCredit', [
            'credits' => SupplierInvoiceReturn::with('supplier')
                
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
            $invoiceReturn = SupplierInvoiceReturn::find($journalEntry->transactionable_id);

            if (!$invoiceReturn) {
                abort(404, 'Supplier Return not found');
            }

            $invoiceReturn->load('items');

            $creditNoteData = [
                'id' => null,
                'supplier' => $invoiceReturn->supplier_id,
                'creditDate' => $invoiceReturn->credit_date,
                'creditNo' => (string)$this->getNextNo(),
                'memo' => $invoiceReturn->memo,
                'items' => $invoiceReturn->items->whereNull('item_id')->map(function ($item) {
                    return [
                        'category' => $item->chart_of_acc_id,
                        'description' => $item->description,
                        'amount' => number_format($item->amount, 2, '.', ''),
                    ];
                })->values()->toArray(),
                'itemDetails' => $invoiceReturn->items->whereNotNull('item_id')->map(function ($item) {
                    return [
                        'product' => $item->item_id,
                        'description' => $item->description,
                        'qty' => $item->quantity,
                        'rate' => number_format($item->rate, 2, '.', ''),
                        'amount' => number_format($item->amount, 2, '.', ''),
                    ];
                })->values()->toArray(),
            ];

            return Inertia::render('Transaction/BillReturnForm', [
                'credit' => $creditNoteData,
                'nextCreditNo' => (string)$this->getNextNo(),
            ]);
        }

        return Inertia::render('Transaction/BillReturnForm', [
            'nextCreditNo' => (string)$this->getNextNo()
        ]);
    }

    public function store(BillReturnRequest $request)
    {
        $request->validated();

        try {
            $journalEntry = DB::transaction(function() use ($request) {
                
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
                $invoiceReturn = SupplierInvoiceReturn::create([
                    'supplier_id' => $request->supplier,
                    'credit_date' => $request->creditDate,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'status' => 'posted',
                ]);

                // Create Credit Note Items (Categories)
                foreach ($categoryItems as $lineItem) {
                    SupplierInvoiceReturnItem::create([
                        'bill_return_id' => $invoiceReturn->id,
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
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $qty = (float)str_replace(',', '', $productItem['qty'] ?? 1);
                        $itemModel->decrement('quantity_on_hand', $qty);
                    }

                    $chartOfAccId = $itemModel?->type === 'inventory'
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::query()->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory')->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id;
                    }

                    SupplierInvoiceReturnItem::create([
                        'bill_return_id' => $invoiceReturn->id,
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
                    'date' => $request->creditDate,
                    'reference' => $request->creditNo,
                    'description' => $request->memo,
                    'transaction_type' => 'supplier_credit',
                    'payee_id' => $request->supplier,
                    'payee_type' => Supplier::class,
                    'total_amount' => $totalAmount,
                    'status' => 'posted',
                    'created_by' => Auth::id(),
                    'transactionable_id' => $invoiceReturn->id,
                    'transactionable_type' => SupplierInvoiceReturn::class,
                ]);

                // Debit Accounts Payable (Reducing what we owe)
                $apAccount = ChartOfAcc::getOrCreateDefault('accounts-payable');

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
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::query()->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory')->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id;
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

            if ($action === 'close') { return back()->with(['success' => 'Supplier Return saved successfully.', 'close_window' => true]); }

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
        $invoiceReturn = SupplierInvoiceReturn::find($journalEntry->transactionable_id);

        if (!$invoiceReturn) {
            abort(404, 'Supplier Return not found');
        }

        $invoiceReturn->load('items');

        $creditNoteData = [
            'id' => $journalEntry->id,
            'supplier' => $invoiceReturn->supplier_id,
            'creditDate' => $invoiceReturn->credit_date,
            'creditNo' => $journalEntry->reference,
            'memo' => $invoiceReturn->memo,
            'items' => $invoiceReturn->items->whereNull('item_id')->map(function ($item) {
                return [
                    'category' => $item->chart_of_acc_id,
                    'description' => $item->description,
                    'amount' => number_format($item->amount, 2, '.', ''),
                ];
            })->values()->toArray(),
            'itemDetails' => $invoiceReturn->items->whereNotNull('item_id')->map(function ($item) {
                return [
                    'product' => $item->item_id,
                    'description' => $item->description,
                    'qty' => $item->quantity,
                    'rate' => number_format($item->rate, 2, '.', ''),
                    'amount' => number_format($item->amount, 2, '.', ''),
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Transaction/BillReturnForm', [
            'credit' => $creditNoteData,
            'nextCreditNo' => $this->getNextNo()
        ]);
    }

    public function update(BillReturnRequest $request, JournalEntry $journalEntry)
    {
        $request->validated();

        try {
            DB::transaction(function() use ($request, $journalEntry) {
                
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
                $invoiceReturn = SupplierInvoiceReturn::findOrFail($journalEntry->transactionable_id);
                $invoiceReturn->update([
                    'supplier_id' => $request->supplier,
                    'credit_date' => $request->creditDate,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                ]);

                // Recreate Items
                foreach ($invoiceReturn->items->whereNotNull('item_id') as $oldItem) {
                    $itemModel = \App\Models\Item::find($oldItem->item_id);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $itemModel->increment('quantity_on_hand', $oldItem->quantity);
                    }
                }
                $invoiceReturn->items()->delete();

                // Create Credit Note Items (Categories)
                foreach ($categoryItems as $lineItem) {
                    SupplierInvoiceReturnItem::create([
                        'bill_return_id' => $invoiceReturn->id,
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
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $qty = (float)str_replace(',', '', $productItem['qty'] ?? 1);
                        $itemModel->decrement('quantity_on_hand', $qty);
                    }

                    $chartOfAccId = $itemModel?->type === 'inventory'
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::query()->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory')->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id;
                    }

                    SupplierInvoiceReturnItem::create([
                        'bill_return_id' => $invoiceReturn->id,
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
                $apAccount = ChartOfAcc::getOrCreateDefault('accounts-payable');

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
                        ? ($itemModel->inventory_account_id ?? (ChartOfAcc::query()->where('sub_type', 'inventory')->first()?->id ?? ChartOfAcc::getOrCreateDefault('inventory')->id))
                        : ($itemModel?->expense_account_id ?? (ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id));

                    if (!$chartOfAccId) {
                        $chartOfAccId = ChartOfAcc::query()->where('account_type', 'payment')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense')->id;
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

            if ($action === 'close') { return back()->with(['success' => 'Supplier Return updated successfully.', 'close_window' => true]); }

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
            $invoiceReturn = SupplierInvoiceReturn::find($journalEntry->transactionable_id);

            if ($invoiceReturn) {
                foreach ($invoiceReturn->items->whereNotNull('item_id') as $oldItem) {
                    $itemModel = \App\Models\Item::find($oldItem->item_id);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $itemModel->increment('quantity_on_hand', $oldItem->quantity);
                    }
                }
                $invoiceReturn->items()->delete();
                $invoiceReturn->delete();
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

    public function print(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $invoiceReturn = SupplierInvoiceReturn::with('items.item', 'items.chartOfAccount', 'supplier', 'company')->findOrFail($journalEntry->transactionable_id);
        $company = $invoiceReturn->company;

        $tableItems = [];
        foreach ($invoiceReturn->items as $item) {
            $desc = "<div class='font-semibold text-gray-800'>" . ($item->item->name ?? $item->chartOfAccount->name ?? 'Item') . "</div>";
            if ($item->description) {
                $desc .= "<div class='text-sm text-gray-500 mt-1'>" . $item->description . "</div>";
            }
            $tableItems[] = [
                $desc,
                $item->quantity,
                ($company->home_currency_prefix ?? 'LKR ') . number_format($item->rate, 2),
                ($company->home_currency_prefix ?? 'LKR ') . number_format($item->amount, 2),
            ];
        }

        $printSetting = \App\Models\PrintSetting::query()
            ->where('document_type', 'supplier_credit')
            ->first();

        return view('print.document', [
            'title' => $printSetting?->custom_title ?: 'Supplier Return Note',
            'headerAlignment' => $printSetting?->header_alignment ?: 'left',
            'staticFooterContent' => $printSetting?->static_footer_content ?: null,
            'layoutConfig' => $printSetting?->layout_config,
            'primaryColor' => $printSetting?->primary_color,
            'textColor' => $printSetting?->text_color,
            'pageSetup' => $printSetting?->page_setup,
            'blockStyles' => $printSetting?->block_styles,
            'documentNo' => $invoiceReturn->credit_note_no,
            'date' => $invoiceReturn->credit_date,
            'dueDate' => null,
            'partyLabel' => 'Return To',
            'partyName' => $invoiceReturn->supplier->display_name ?? $invoiceReturn->supplier->company_name,
            'partyAddress' => '',
            'partyEmail' => $invoiceReturn->supplier->email ?? '',
            'tableHeaders' => ['Description', 'Qty', 'Rate', 'Amount'],
            'tableItems' => $tableItems,
            'totalAmount' => $invoiceReturn->total_amount,
            'memo' => $invoiceReturn->memo,
            'statementMessage' => null,
            'company' => $company,
        ]);
    }

    private function getNextNo()
    {
        $last = SupplierInvoiceReturn::query()->latest()->first();
        return $last ? (int)filter_var($last->id, FILTER_SANITIZE_NUMBER_INT) + 1 : 1001;
    }
}
