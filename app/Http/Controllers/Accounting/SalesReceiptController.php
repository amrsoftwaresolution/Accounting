<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\SalesReceipt;
use App\Models\SalesReceiptItem;
use App\Models\Customer;
use App\Models\ChartOfAcc;
use App\Models\PaymentMethod;
use App\Models\Item;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SalesReceiptController extends Controller
{
    public function create()
    {
        $companyId = session('active_company_id');

        $paymentMethods = PaymentMethod::withoutGlobalScopes()
            ->where('is_active', true)
            ->where(function ($query) use ($companyId) {
                $query->whereNull('company_id');

                if ($companyId) {
                    $query->orWhere('company_id', $companyId);
                }
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Transaction/SalesReceiptForm', [
            'customers' => Customer::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'paymentMethods' => $paymentMethods,
            'items' => Item::orderBy('name')->get(),
            'nextReceiptNo' => $this->getNextReceiptNo()
        ]);
    }

    public function store(Request $request)
    {
       // Change ONLY this block inside the store method:
$validated = $request->validate([
    'customer' => 'required|uuid',
    'receiptDate' => 'required|date',
    'receiptNo' => 'required', // REMOVED '|string' to allow numbers
    'paymentMethod' => 'nullable|uuid',
    'depositTo' => 'required|uuid',
    'items' => 'required|array|min:1',
    'items.*.product' => 'required|uuid',
    'items.*.qty' => 'required|numeric',
    'items.*.rate' => 'required|numeric',
    'items.*.amount' => 'required',
    'action' => 'nullable|string',
]);
        try {
            DB::transaction(function() use ($request) {
                // Filter out empty items
                $items = collect($request->items)->filter(function($item) {
                    return !empty($item['product']) && (float)str_replace(',', '', $item['amount']) > 0;
                })->values()->all();

                if (empty($items)) {
                    throw new \Exception('At least one item with product and amount is required.');
                }

                $totalAmount = collect($items)->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Save Document (Business Details)
                $receipt = SalesReceipt::create([
                    'company_id' => session('active_company_id'),
                    'customer_id' => $request->customer,
                    'email' => $request->email,
                    'receipt_date' => $request->receiptDate,
                    'payment_method_id' => $request->paymentMethod,
                    'deposit_to_account_id' => $request->depositTo,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'statement_message' => $request->statementMessage,
                    'status' => 'posted',
                ]);

                foreach ($items as $itemData) {
                    SalesReceiptItem::create([
                        'sales_receipt_id' => $receipt->id,
                        'item_id' => $itemData['product'],
                        'description' => $itemData['description'] ?? '',
                        'quantity' => (float)($itemData['qty'] ?? 1),
                        'rate' => (float)($itemData['rate'] ?? 0),
                        'amount' => (float) str_replace(',', '', $itemData['amount']),
                        'service_date' => $itemData['serviceDate'] ?? null,
                    ]);
                }

                // 2. Save Financial Truth (Journal Entry)
                $journalEntry = JournalEntry::create([
                    'date' => $request->receiptDate,
                    'reference' => $request->receiptNo,
                    'description' => $request->memo,
                    'transaction_type' => 'sales_receipt',
                    'payee_id' => $request->customer,
                    'payee_type' => Customer::class,
                    'total_amount' => $totalAmount,
                    'status' => 'posted',
                    'created_by' => Auth::id(),
                    'transactionable_id' => $receipt->id,
                    'transactionable_type' => SalesReceipt::class,
                ]);

                // Debit Cash/Bank (Deposit To)
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $request->depositTo,
                    'debit' => $totalAmount,
                    'credit' => 0,
                    'memo' => $request->memo,
                ]);

                // Credit Income accounts
                foreach ($items as $itemData) {
                    $itemModel = Item::find($itemData['product']);
                    $incomeAccount = $itemModel?->income_account_id ?? ChartOfAcc::where('account_type', 'income')->first()?->id;

                    if (!$incomeAccount) {
                        throw new \Exception('Income account not found for product: ' . $itemData['product']);
                    }

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $incomeAccount,
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $itemData['amount']),
                        'memo' => $itemData['description'] ?? $request->memo,
                    ]);
                }
            });
        } catch (\Exception $e) {
            \Log::error('Sales Receipt save error: ' . $e->getMessage(), [
                'data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        $action = $request->input('action', 'save');
        if ($action === 'close') {
            return redirect()->route('chart-of-account.index')->with('success', 'Sales Receipt saved successfully.');
        }

        if ($action === 'new') {
            return redirect()->route('receipt')->with('success', 'Sales Receipt saved successfully.');
        }

        return redirect()->back()->with('success', 'Sales Receipt saved successfully.');

    }

   private function getNextReceiptNo()
{
    // Use the actual DB column name (usually receipt_no)
    $last = SalesReceipt::where('company_id', session('active_company_id'))->latest()->first();
    // If the column is receipt_no, use $last->receipt_no
    return $last ? (int)$last->receipt_no + 1 : 1001;
}
}
