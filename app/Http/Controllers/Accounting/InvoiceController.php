<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\ChartOfAcc;
use App\Models\Customer;
use App\Http\Requests\Accounting\StoreInvoiceRequest;
use App\Http\Requests\Accounting\UpdateInvoiceRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function create(Request $request)
    {
        $lastRef = JournalEntry::where('transaction_type', 'invoice')
            ->whereNotNull('reference')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->first();

        $nextInvoiceNo = ($lastRef && is_numeric($lastRef->reference)) ? (int) $lastRef->reference + 1 : 1001;
        $nextInvoiceNoLabel = (string) str_pad($nextInvoiceNo, 4, '0', STR_PAD_LEFT);

        if ($copyId = $request->query('copy')) {
            $journalEntry = JournalEntry::findOrFail($copyId);
            $journalEntry->load('lines');
            $invoice = \App\Models\Invoice::find($journalEntry->transactionable_id);

            $invoiceData = [
                'id' => null,
                'customer' => $journalEntry->payee_id,
                'email' => $invoice?->email ?? '',
                'billingAddress' => $invoice?->billing_address ?? '',
                'terms' => $invoice?->terms ?? 'Net 30',
                'invoiceNo' => $nextInvoiceNoLabel,
                'invoiceDate' => $journalEntry->date,
                'dueDate' => $journalEntry->due_date,
                'memo' => $journalEntry->description,
                'statementMessage' => $invoice?->statement_message ?? '',
                'items' => $journalEntry->lines->where('credit', '>', 0)->map(function ($line) {
                    $item = \App\Models\Item::where('income_account_id', $line->chart_of_acc_id)->first();
                    return [
                        'product' => $item?->id,
                        'description' => $line->memo,
                        'serviceDate' => $line->service_date,
                        'amount' => $line->credit,
                        'qty' => 1,
                        'rate' => $line->credit,
                    ];
                })->values()->toArray(),
            ];

            return Inertia::render('Transaction/InvoiceForm', [
                'nextInvoiceNo' => $nextInvoiceNoLabel,
                'invoice' => $invoiceData,
            ]);
        }

        return Inertia::render('Transaction/InvoiceForm', [
            'nextInvoiceNo' => $nextInvoiceNoLabel
        ]);
    }

    public function store(StoreInvoiceRequest $request)
    {
        $validated = $request->validated();

        $journalEntry = DB::transaction(function () use ($request) {
            $totalAmount = collect($request->items)->sum(function ($item) {
                return (float) str_replace(',', '', $item['amount']);
            });

            // 1. Create Business Document (Invoice)
            $invoice = \App\Models\Invoice::create([
                'company_id' => session('active_company_id'),
                'customer_id' => $request->customer,
                'email' => $request->email,
                'billing_address' => $request->billingAddress,
                'terms' => $request->terms,
                'invoice_date' => $request->invoiceDate,
                'due_date' => $request->dueDate,
                'invoice_no' => $request->invoiceNo,
                'total_amount' => $totalAmount,
                'memo' => $request->memo,
                'statement_message' => $request->statementMessage,
                'status' => 'posted',
            ]);

            foreach ($request->items as $lineItem) {
                \App\Models\InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_id' => $lineItem['product'],
                    'description' => $lineItem['description'] ?? '',
                    'quantity' => $lineItem['qty'] ?? 1,
                    'rate' => (float) str_replace(',', '', $lineItem['rate'] ?? 0),
                    'amount' => (float) str_replace(',', '', $lineItem['amount']),
                    'service_date' => $lineItem['serviceDate'] ?? null,
                ]);
            }

            // 2. Create Financial Truth (Journal Entry)
            $journalEntry = JournalEntry::create([
                'date' => $request->invoiceDate,
                'due_date' => $request->dueDate,
                'reference' => $request->invoiceNo,
                'description' => $request->memo,
                'transaction_type' => 'invoice',
                'payee_id' => $request->customer,
                'payee_type' => Customer::class,
                'total_amount' => $totalAmount,
                'status' => 'posted',
                'created_by' => Auth::id(),
                'transactionable_id' => $invoice->id,
                'transactionable_type' => \App\Models\Invoice::class,
            ]);

            // Income Credits
            foreach ($request->items as $lineItem) {
                $itemModel = \App\Models\Item::find($lineItem['product']);
                $incomeAccount = $itemModel?->income_account_id ?? (ChartOfAcc::where('account_type', 'income')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-income')->id);

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $incomeAccount,
                    'debit' => 0,
                    'credit' => (float) str_replace(',', '', $lineItem['amount']),
                    'memo' => $lineItem['description'] ?? $request->memo,
                    'service_date' => $lineItem['serviceDate'] ?? null,
                ]);
            }

            // Accounts Receivable Debit
            $arAccount = ChartOfAcc::getOrCreateDefault('accounts-receivable');
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $arAccount->id,
                'debit' => $totalAmount,
                'credit' => 0,
                'memo' => $request->memo,
            ]);

            return $journalEntry;
        });

        return redirect()->route('invoice.edit', $journalEntry->id)->with('success', 'credit Sale saved successfully.');
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $invoice = \App\Models\Invoice::find($journalEntry->transactionable_id);

        $invoiceData = [
            'id' => $journalEntry->id,
            'customer' => $journalEntry->payee_id,
            'email' => $invoice?->email ?? '',
            'billingAddress' => $invoice?->billing_address ?? '',
            'terms' => $invoice?->terms ?? 'Net 30',
            'invoiceNo' => $journalEntry->reference,
            'invoiceDate' => $journalEntry->date,
            'dueDate' => $journalEntry->due_date,
            'memo' => $journalEntry->description,
            'statementMessage' => $invoice?->statement_message ?? '',
            'items' => $journalEntry->lines->where('credit', '>', 0)->map(function ($line) {
                $item = \App\Models\Item::where('income_account_id', $line->chart_of_acc_id)->first();
                return [
                    'product' => $item?->id,
                    'description' => $line->memo,
                    'serviceDate' => $line->service_date,
                    'amount' => $line->credit,
                    'qty' => 1,
                    'rate' => $line->credit,
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Transaction/InvoiceForm', [
            'customers' => Customer::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'items' => \App\Models\Item::orderBy('name')->get(),
            'invoice' => $invoiceData,
        ]);
    }

    public function update(UpdateInvoiceRequest $request, JournalEntry $journalEntry)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $journalEntry) {
            $totalAmount = collect($request->items)->sum(function ($item) {
                return (float) str_replace(',', '', $item['amount']);
            });

            // 1. Update Business Document
            $invoice = \App\Models\Invoice::find($journalEntry->transactionable_id);
            if ($invoice) {
                $invoice->update([
                    'customer_id' => $request->customer,
                    'email' => $request->email,
                    'billing_address' => $request->billingAddress,
                    'terms' => $request->terms,
                    'invoice_date' => $request->invoiceDate,
                    'due_date' => $request->dueDate,
                    'invoice_no' => $request->invoiceNo,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'statement_message' => $request->statementMessage,
                ]);

                $invoice->items()->delete();
                foreach ($request->items as $lineItem) {
                    \App\Models\InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'item_id' => $lineItem['product'],
                        'description' => $lineItem['description'] ?? '',
                        'quantity' => $lineItem['qty'] ?? 1,
                        'rate' => (float) str_replace(',', '', $lineItem['rate'] ?? 0),
                        'amount' => (float) str_replace(',', '', $lineItem['amount']),
                        'service_date' => $lineItem['serviceDate'] ?? null,
                    ]);
                }
            }

            // 2. Update Financial Truth
            $journalEntry->update([
                'date' => $request->invoiceDate,
                'due_date' => $request->dueDate,
                'reference' => $request->invoiceNo,
                'description' => $request->memo,
                'payee_id' => $request->customer,
                'total_amount' => $totalAmount,
            ]);

            $journalEntry->lines->each->delete();

            foreach ($request->items as $lineItem) {
                $itemModel = \App\Models\Item::find($lineItem['product']);
                $incomeAccount = $itemModel?->income_account_id ?? (ChartOfAcc::where('account_type', 'income')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-income')->id);

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $incomeAccount,
                    'debit' => 0,
                    'credit' => (float) str_replace(',', '', $lineItem['amount']),
                    'memo' => $lineItem['description'] ?? $request->memo,
                    'service_date' => $lineItem['serviceDate'] ?? null,
                ]);
            }

            $arAccount = ChartOfAcc::getOrCreateDefault('accounts-receivable');
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $arAccount->id,
                'debit' => $totalAmount,
                'credit' => 0,
                'memo' => $request->memo,
            ]);
        });

        return redirect()->back()->with('success', 'Invoice updated successfully.');
    }

    public function destroy(JournalEntry $journalEntry)
    {
        DB::transaction(function () use ($journalEntry) {
            $invoice = \App\Models\Invoice::find($journalEntry->transactionable_id);

            if ($invoice) {
                $invoice->items()->delete();
                $invoice->delete();
            }

            $journalEntry->lines->each->delete();
            $journalEntry->delete();
        });

        return redirect()->route('dashboard')->with('success', 'Invoice deleted successfully.');
    }
}
