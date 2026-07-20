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
                'items' => $invoice?->items->map(function ($invoiceItem) {
                    return [
                        'product' => $invoiceItem->item_id,
                        'description' => $invoiceItem->description,
                        'serviceDate' => $invoiceItem->service_date,
                        'amount' => $invoiceItem->amount,
                        'qty' => $invoiceItem->quantity,
                        'rate' => $invoiceItem->rate,
                    ];
                })->toArray() ?? [],
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

                if ($itemModel && $itemModel->type === 'inventory') {
                    $qty = (float) str_replace(',', '', $lineItem['qty'] ?? 1);
                    $itemModel->decrement('quantity_on_hand', $qty);
                    $cogsAmount = $qty * (float) $itemModel->purchase_price;

                    if ($cogsAmount > 0) {
                        $cogsAccount = $itemModel->expense_account_id ?? ChartOfAcc::getOrCreateDefault('cost-of-goods-sold')->id;
                        $inventoryAccount = $itemModel->inventory_account_id ?? ChartOfAcc::getOrCreateDefault('inventory')->id;

                        JournalEntryLine::create([
                            'journal_entry_id' => $journalEntry->id,
                            'chart_of_acc_id' => $cogsAccount,
                            'debit' => $cogsAmount,
                            'credit' => 0,
                            'memo' => 'Cost of goods sold: ' . ($lineItem['description'] ?? $itemModel->name) . " (Qty: {$qty})",
                        ]);

                        JournalEntryLine::create([
                            'journal_entry_id' => $journalEntry->id,
                            'chart_of_acc_id' => $inventoryAccount,
                            'debit' => 0,
                            'credit' => $cogsAmount,
                            'memo' => 'Inventory reduction: ' . ($lineItem['description'] ?? $itemModel->name) . " (Qty: {$qty})",
                        ]);
                    }
                }
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

        $action = $request->input('action', 'save');

        if ($action === 'close') {
            return redirect()->route('dashboard')->with('success', 'credit Sale saved successfully.');
        }

        if ($action === 'new') {
            return redirect()->route('invoice')->with('success', 'credit Sale saved successfully.');
        }

       return redirect()->route('invoice.edit', $journalEntry->id)->with('success', 'Credit Sale saved successfully.');

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
            'items' => $invoice?->items->map(function ($invoiceItem) {
                return [
                    'product' => $invoiceItem->item_id,
                    'description' => $invoiceItem->description,
                    'serviceDate' => $invoiceItem->service_date,
                    'amount' => $invoiceItem->amount,
                    'qty' => $invoiceItem->quantity,
                    'rate' => $invoiceItem->rate,
                ];
            })->toArray() ?? [],
        ];

        return Inertia::render('Transaction/InvoiceForm', [
            'customers' => Customer::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'items' => \App\Models\Item::orderBy('name')->get(),
            'invoice' => $invoiceData,
        ]);
    }

    public function print(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $invoice = \App\Models\Invoice::with('items.item', 'customer', 'company')->findOrFail($journalEntry->transactionable_id);
        $company = $invoice->company;

        $tableItems = [];
        foreach ($invoice->items as $item) {
            $desc = "<div class='font-semibold text-gray-800'>" . ($item->item->name ?? 'Item') . "</div>";
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
            ->where('document_type', 'invoice')
            ->first();

        return view('print.document', [
            'title' => $printSetting?->custom_title ?: 'Sales Invoice',
            'headerAlignment' => $printSetting?->header_alignment ?: 'left',
            'staticFooterContent' => $printSetting?->static_footer_content ?: null,
            'layoutConfig' => $printSetting?->layout_config,
            'primaryColor' => $printSetting?->primary_color,
            'textColor' => $printSetting?->text_color,
            'pageSetup' => $printSetting?->page_setup,
            'blockStyles' => $printSetting?->block_styles,
            'documentNo' => $invoice->invoice_no,
            'date' => $invoice->invoice_date,
            'dueDate' => $invoice->due_date,
            'partyLabel' => 'Bill To',
            'partyName' => $invoice->customer->display_name ?? $invoice->customer->company_name,
            'partyAddress' => $invoice->billing_address,
            'partyEmail' => $invoice->email,
            'tableHeaders' => ['Description', 'Qty', 'Rate', 'Amount'],
            'tableItems' => $tableItems,
            'totalAmount' => $invoice->total_amount,
            'memo' => $invoice->memo,
            'statementMessage' => $invoice->statement_message,
            'company' => $company,
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

                foreach ($invoice->items as $oldItem) {
                    $itemModel = \App\Models\Item::find($oldItem->item_id);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $itemModel->increment('quantity_on_hand', $oldItem->quantity);
                    }
                }
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

                if ($itemModel && $itemModel->type === 'inventory') {
                    $qty = (float) str_replace(',', '', $lineItem['qty'] ?? 1);
                    $itemModel->decrement('quantity_on_hand', $qty);
                    $cogsAmount = $qty * (float) $itemModel->purchase_price;

                    if ($cogsAmount > 0) {
                        $cogsAccount = $itemModel->expense_account_id ?? ChartOfAcc::getOrCreateDefault('cost-of-goods-sold')->id;
                        $inventoryAccount = $itemModel->inventory_account_id ?? ChartOfAcc::getOrCreateDefault('inventory')->id;

                        JournalEntryLine::create([
                            'journal_entry_id' => $journalEntry->id,
                            'chart_of_acc_id' => $cogsAccount,
                            'debit' => $cogsAmount,
                            'credit' => 0,
                            'memo' => 'Cost of goods sold: ' . ($lineItem['description'] ?? $itemModel->name) . " (Qty: {$qty})",
                        ]);

                        JournalEntryLine::create([
                            'journal_entry_id' => $journalEntry->id,
                            'chart_of_acc_id' => $inventoryAccount,
                            'debit' => 0,
                            'credit' => $cogsAmount,
                            'memo' => 'Inventory reduction: ' . ($lineItem['description'] ?? $itemModel->name) . " (Qty: {$qty})",
                        ]);
                    }
                }
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

        $action = $request->input('action', 'save');
        if ($action === 'close') {
            return redirect()->route('dashboard')->with('success', 'Invoice updated successfully.');
        }
        if ($action === 'new') {
            return redirect()->route('invoice')->with('success', 'Invoice updated successfully.');
        }
        return redirect()->route('invoice.edit', $journalEntry->id)->with('success', 'Invoice updated successfully.');
    }


    public function destroy(JournalEntry $journalEntry)
    {
        $chartOfAccountId = $journalEntry->lines->first()?->chart_of_acc_id 
            ?? $journalEntry->lines->first()?->chart_of_account_id 
            ?? $journalEntry->lines->first()?->account_id;

        DB::transaction(function () use ($journalEntry) {
            $invoice = \App\Models\Invoice::find($journalEntry->transactionable_id);

            if ($invoice) {
                foreach ($invoice->items as $oldItem) {
                    $itemModel = \App\Models\Item::find($oldItem->item_id);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $itemModel->increment('quantity_on_hand', $oldItem->quantity);
                    }
                }
                $invoice->items()->delete();
                $invoice->delete();
            }

            $journalEntry->lines->each->delete();
            $journalEntry->delete();
        });
        if ($chartOfAccountId) {
            return redirect()->route('chart-of-account.history', ['chart_of_account' => $chartOfAccountId])
                ->with('success', 'Invoice deleted successfully.');
        }

        return redirect()->route('chart-of-account.index')
            ->with('success', 'Invoice deleted successfully.');
    }
}