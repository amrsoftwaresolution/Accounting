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

    public function create()
    {
        return Inertia::render('Transaction/SupplierCreditForm', [
            'nextCreditNo' => (string)$this->getNextNo()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier' => 'required',
            'creditDate' => 'required|date',
            'creditNo' => 'required',
            'items' => 'nullable|array',
            'itemDetails' => 'nullable|array',
        ]);

        try {
            DB::transaction(function() use ($request) {
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
            });

            return redirect()->route('dashboard')->with('success', 'Supplier Return saved successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function getNextNo()
    {
        $last = SupplierCreditNote::where('company_id', session('active_company_id'))->latest()->first();
        return $last ? (int)filter_var($last->id, FILTER_SANITIZE_NUMBER_INT) + 1 : 1001;
    }
}
