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
        return Inertia::render('Transaction/SalesReceiptForm', [
            'customers' => Customer::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'paymentMethods' => PaymentMethod::orderBy('name')->get(),
            'items' => Item::orderBy('name')->get(),
            'nextReceiptNo' => $this->getNextReceiptNo()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer' => 'required',
            'receiptDate' => 'required|date',
            'receiptNo' => 'required',
            'items' => 'required|array|min:1',
            'depositTo' => 'required',
        ]);

        DB::transaction(function() use ($request) {
            $totalAmount = collect($request->items)->sum(function($item) {
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

            foreach ($request->items as $itemData) {
                SalesReceiptItem::create([
                    'sales_receipt_id' => $receipt->id,
                    'item_id' => $itemData['product'],
                    'description' => $itemData['description'],
                    'quantity' => $itemData['qty'] ?? 1,
                    'rate' => $itemData['rate'] ?? 0,
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
            foreach ($request->items as $itemData) {
                $itemModel = Item::find($itemData['product']);
                $incomeAccount = $itemModel?->income_account_id ?? ChartOfAcc::where('account_type', 'income')->first()?->id;

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $incomeAccount,
                    'debit' => 0,
                    'credit' => (float) str_replace(',', '', $itemData['amount']),
                    'memo' => $itemData['description'] ?? $request->memo,
                ]);
            }
        });

        return redirect()->route('dashboard')->with('success', 'Sales Receipt saved successfully.');
    }

    private function getNextReceiptNo()
    {
        $last = SalesReceipt::where('company_id', session('active_company_id'))->latest()->first();
        return $last ? (int)$last->receiptNo + 1 : 1001;
    }
}
