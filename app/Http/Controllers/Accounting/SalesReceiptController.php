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
use App\Http\Requests\Accounting\StoreSalesReceiptRequest;
use App\Http\Requests\Accounting\UpdateSalesReceiptRequest;

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
            'paymentMethods' => $paymentMethods,
            'nextReceiptNo' => $this->getNextReceiptNo()
        ]);
    }

    public function store(StoreSalesReceiptRequest $request)
    {
        $validated = $request->validated();
        try {
            $journalEntry = DB::transaction(function() use ($request) {
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
                    'receipt_no' => $request->receiptNo,
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
                        'quantity' => (float)str_replace(',', '', $itemData['qty'] ?? 1),
                        'rate' => (float)str_replace(',', '', $itemData['rate'] ?? 0),
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
                    $incomeAccount = $itemModel?->income_account_id ?? (ChartOfAcc::where('account_type', 'income')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-income')->id);

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $incomeAccount,
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $itemData['amount']),
                        'memo' => $itemData['description'] ?? $request->memo,
                    ]);
                }

                return $journalEntry;
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
            return redirect()->route('chart-of-account.index')->with('success', 'Cash sale saved successfully.');
        }

        if ($action === 'new') {
            return redirect()->route('receipt')->with('success', 'Cash sale saved successfully.');
        }

        return redirect()->route('receipt.edit', $journalEntry->id)->with('success', 'Cash sale saved successfully.');

    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $receipt = SalesReceipt::find($journalEntry->transactionable_id);

        if (!$receipt) {
            abort(404, 'Sales receipt not found');
        }

        $receipt->load('customer.addresses');
        $customer = $receipt->customer;
        $billingAddress = '';
        if ($customer) {
            $billingAddressModel = $customer->addresses->where('type', 'billing')->first();
            if ($billingAddressModel) {
                $parts = array_filter([
                    $billingAddressModel->address_line_1,
                    $billingAddressModel->address_line_2,
                    $billingAddressModel->city,
                    $billingAddressModel->province,
                    $billingAddressModel->postal_code,
                    $billingAddressModel->country
                ]);
                $billingAddress = implode(", ", $parts);
            }
        }

        $receiptData = [
            'id' => $journalEntry->id,
            'receipt_id' => $receipt->id,
            'customer' => $receipt->customer_id,
            'email' => $receipt->email,
            'billingAddress' => $billingAddress,
            'receiptDate' => $receipt->receipt_date,
            'receiptNo' => $receipt->receipt_no,
            'paymentMethod' => $receipt->payment_method_id,
            'depositTo' => $receipt->deposit_to_account_id,
            'memo' => $receipt->memo,
            'statementMessage' => $receipt->statement_message,
            'items' => $receipt->items->map(function ($item) {
                return [
                    'product' => $item->item_id,
                    'serviceDate' => $item->service_date,
                    'description' => $item->description,
                    'qty' => $item->quantity,
                    'rate' => number_format($item->rate, 2, '.', ''),
                    'amount' => number_format($item->amount, 2, '.', ''),
                ];
            })->toArray(),
        ];

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
            'receipt' => $receiptData,
            'paymentMethods' => $paymentMethods,
            'nextReceiptNo' => $this->getNextReceiptNo()
        ]);
    }

    public function update(UpdateSalesReceiptRequest $request, JournalEntry $journalEntry)
    {
        $validated = $request->validated();
        
        try {
            DB::transaction(function() use ($request, $journalEntry) {
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

                // 1. Update Business Document (SalesReceipt)
                $receipt = SalesReceipt::find($journalEntry->transactionable_id);
                if (!$receipt) {
                    throw new \Exception('Sales receipt document not found');
                }

                $receipt->update([
                    'receipt_no' => $request->receiptNo,
                    'customer_id' => $request->customer,
                    'email' => $request->email,
                    'receipt_date' => $request->receiptDate,
                    'payment_method_id' => $request->paymentMethod,
                    'deposit_to_account_id' => $request->depositTo,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'statement_message' => $request->statementMessage,
                ]);

                $receipt->items()->delete();
                foreach ($items as $itemData) {
                    SalesReceiptItem::create([
                        'sales_receipt_id' => $receipt->id,
                        'item_id' => $itemData['product'],
                        'description' => $itemData['description'] ?? '',
                        'quantity' => (float)str_replace(',', '', $itemData['qty'] ?? 1),
                        'rate' => (float)str_replace(',', '', $itemData['rate'] ?? 0),
                        'amount' => (float) str_replace(',', '', $itemData['amount']),
                        'service_date' => $itemData['serviceDate'] ?? null,
                    ]);
                }

                // 2. Update Financial Truth (Journal Entry)
                $journalEntry->update([
                    'date' => $request->receiptDate,
                    'reference' => $request->receiptNo,
                    'description' => $request->memo,
                    'payee_id' => $request->customer,
                    'total_amount' => $totalAmount,
                ]);

                $journalEntry->lines()->delete();

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
                    $incomeAccount = $itemModel?->income_account_id ?? (ChartOfAcc::where('account_type', 'income')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-income')->id);

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $incomeAccount,
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $itemData['amount']),
                        'memo' => $itemData['description'] ?? $request->memo,
                    ]);
                }
            });

            $action = $request->input('action', 'save');
            if ($action === 'close') {
                return redirect()->route('chart-of-account.index')->with('success', 'Cash sale updated successfully.');
            }

            if ($action === 'new') {
                return redirect()->route('receipt')->with('success', 'Cash sale updated successfully.');
            }

            return redirect()->back()->with('success', 'Cash sale updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

   private function getNextReceiptNo()
   {
       $last = SalesReceipt::where('company_id', session('active_company_id'))->latest()->first();
       return $last ? (int)$last->receipt_no + 1 : 1001;
   }
}
