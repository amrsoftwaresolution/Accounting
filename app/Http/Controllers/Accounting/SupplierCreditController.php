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
            'items' => 'required|array|min:1',
            'items.*.product' => 'required',
            'items.*.amount' => 'required',
        ]);

        try {
            DB::transaction(function() use ($request) {
                $totalAmount = collect($request->items)->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Create Credit Note
                $creditNote = SupplierCreditNote::create([
                    'company_id' => session('active_company_id'),
                    'supplier_id' => $request->supplier,
                    'credit_date' => $request->creditDate,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'status' => 'posted',
                ]);

                foreach ($request->items as $itemData) {
                    SupplierCreditNoteItem::create([
                        'supplier_credit_note_id' => $creditNote->id,
                        'item_id' => $itemData['product'],
                        'description' => $itemData['description'] ?? '',
                        'quantity' => $itemData['qty'] ?? 1,
                        'rate' => $itemData['rate'] ?? 0,
                        'amount' => (float) str_replace(',', '', $itemData['amount']),
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
                    'transactionable_id' => $creditNote->id,
                    'transactionable_type' => SupplierCreditNote::class,
                ]);

                // Debit Accounts Payable (Reducing what we owe)
                $apAccount = ChartOfAcc::where('sub_type', 'accounts-payable')->first();
                if (!$apAccount) throw new \Exception("Accounts Payable account not found.");

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id,
                    'debit' => $totalAmount,
                    'credit' => 0,
                    'memo' => $request->memo,
                ]);

                // Credit Expense/Inventory
                foreach ($request->items as $itemData) {
                    $itemModel = Item::find($itemData['product']);
                    $expenseAccount = $itemModel?->expense_account_id ?? ChartOfAcc::where('account_type', 'expense')->first()?->id;

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $expenseAccount,
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $itemData['amount']),
                        'memo' => $itemData['description'] ?? $request->memo,
                    ]);
                }
            });

            return redirect()->route('SupplierCredit.index')->with('success', 'Supplier Credit saved.');
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
