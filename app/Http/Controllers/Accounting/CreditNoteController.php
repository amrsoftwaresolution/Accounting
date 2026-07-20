<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\CreditNote;
use App\Models\CreditNoteItem;
use App\Models\Customer;
use App\Models\ChartOfAcc;
use App\Models\Item;
use App\Http\Requests\Accounting\StoreCreditNoteRequest;
use App\Http\Requests\Accounting\UpdateCreditNoteRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CreditNoteController extends Controller
{
    public function create(Request $request)
    {
        if ($copyId = $request->query('copy')) {
            $journalEntry = JournalEntry::findOrFail($copyId);
            $creditNote = CreditNote::find($journalEntry->transactionable_id);

            if (!$creditNote) {
                abort(404, 'Sales Return not found');
            }

            $creditNote->load('items');

            $creditNoteData = [
                'id' => null,
                'customer' => $creditNote->customer_id,
                'email' => $creditNote->email,
                'creditNoteDate' => $creditNote->credit_note_date,
                'creditNoteNo' => $this->getNextNo(),
                'memo' => $creditNote->memo,
                'statementMessage' => $creditNote->statement_message,
                'items' => $creditNote->items->map(function ($item) {
                    return [
                        'product' => $item->item_id,
                        'description' => $item->description,
                        'qty' => $item->quantity,
                        'rate' => number_format($item->rate, 2, '.', ''),
                        'amount' => number_format($item->amount, 2, '.', ''),
                    ];
                })->toArray(),
            ];

            return Inertia::render('Transaction/CreditNoteForm', [
                'creditNote' => $creditNoteData,
                'nextCreditNoteNo' => $this->getNextNo(),
            ]);
        }

        return Inertia::render('Transaction/CreditNoteForm', [
            'nextCreditNoteNo' => $this->getNextNo()
        ]);
    }

    public function store(StoreCreditNoteRequest $request)
    {
        $validated = $request->validated();

        try {
            $journalEntry = DB::transaction(function() use ($request) {
                $totalAmount = collect($request->items)->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Business Details
                $creditNote = CreditNote::create([
                    'customer_id' => $request->customer,
                    'email' => $request->email,
                    'credit_note_date' => $request->creditNoteDate,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'statement_message' => $request->statementMessage,
                    'status' => 'posted',
                ]);

                foreach ($request->items as $itemData) {
                    CreditNoteItem::create([
                        'credit_note_id' => $creditNote->id,
                        'item_id' => $itemData['product'],
                        'description' => $itemData['description'] ?? '',
                        'quantity' => $itemData['qty'] ?? 1,
                        'rate' => $itemData['rate'] ?? 0,
                        'amount' => (float) str_replace(',', '', $itemData['amount']),
                    ]);

                    $itemModel = \App\Models\Item::find($itemData['product']);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $qty = (float) str_replace(',', '', $itemData['qty'] ?? 1);
                        $itemModel->increment('quantity_on_hand', $qty);
                    }
                }

                // 2. Financial Truth (Journal Entry)
                $journalEntry = JournalEntry::create([
                    'date' => $request->creditNoteDate,
                    'reference' => $request->creditNoteNo,
                    'description' => $request->memo,
                    'transaction_type' => 'credit_note',
                    'payee_id' => $request->customer,
                    'payee_type' => Customer::class,
                    'total_amount' => $totalAmount,
                    'status' => 'posted',
                    'created_by' => Auth::id(),
                    'transactionable_id' => $creditNote->id,
                    'transactionable_type' => CreditNote::class,
                ]);

                // Credit Accounts Receivable (Reduce balance)
                $arAccount = ChartOfAcc::getOrCreateDefault('accounts-receivable');
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $arAccount->id,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);

                // Debit Income / Returns account
                foreach ($request->items as $itemData) {
                    $itemModel = Item::find($itemData['product']);
                    $incomeAccount = $itemModel?->income_account_id ?? (ChartOfAcc::where('account_type', 'income')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-income')->id);

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $incomeAccount,
                        'debit' => (float) str_replace(',', '', $itemData['amount']),
                        'credit' => 0,
                        'memo' => $itemData['description'] ?? $request->memo,
                    ]);
                }

                return $journalEntry;
            });

            $action = $request->input('action', 'save');
            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Sales Return saved successfully.');
            }

            if ($action === 'new') {
                return redirect()->route('credit-note')->with('success', 'Sales Return saved successfully.');
            }

            return redirect()->route('credit-note.edit', $journalEntry->id)->with('success', 'Sales Return saved successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $creditNote = CreditNote::find($journalEntry->transactionable_id);

        if (!$creditNote) {
            abort(404, 'Sales Return not found');
        }

        $creditNote->load('items');

        $creditNoteData = [
            'id' => $journalEntry->id,
            'customer' => $creditNote->customer_id,
            'email' => $creditNote->email,
            'creditNoteDate' => $creditNote->credit_note_date,
            'creditNoteNo' => $journalEntry->reference,
            'memo' => $creditNote->memo,
            'statementMessage' => $creditNote->statement_message,
            'items' => $creditNote->items->map(function ($item) {
                return [
                    'product' => $item->item_id,
                    'description' => $item->description,
                    'qty' => $item->quantity,
                    'rate' => number_format($item->rate, 2, '.', ''),
                    'amount' => number_format($item->amount, 2, '.', ''),
                ];
            })->toArray(),
        ];

        return Inertia::render('Transaction/CreditNoteForm', [
            'creditNote' => $creditNoteData,
            'nextCreditNoteNo' => $this->getNextNo()
        ]);
    }

    public function update(UpdateCreditNoteRequest $request, JournalEntry $journalEntry)
    {
        $request->validated();

        try {
            DB::transaction(function() use ($request, $journalEntry) {
                $totalAmount = collect($request->items)->sum(function($item) {
                    return (float) str_replace(',', '', $item['amount']);
                });

                // 1. Update Business Details
                $creditNote = CreditNote::findOrFail($journalEntry->transactionable_id);
                $creditNote->update([
                    'customer_id' => $request->customer,
                    'email' => $request->email,
                    'credit_note_date' => $request->creditNoteDate,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'statement_message' => $request->statementMessage,
                ]);

                // Recreate items
                foreach ($creditNote->items as $oldItem) {
                    $itemModel = \App\Models\Item::find($oldItem->item_id);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $itemModel->decrement('quantity_on_hand', $oldItem->quantity);
                    }
                }
                $creditNote->items()->delete();
                foreach ($request->items as $itemData) {
                    CreditNoteItem::create([
                        'credit_note_id' => $creditNote->id,
                        'item_id' => $itemData['product'],
                        'description' => $itemData['description'] ?? '',
                        'quantity' => $itemData['qty'] ?? 1,
                        'rate' => $itemData['rate'] ?? 0,
                        'amount' => (float) str_replace(',', '', $itemData['amount']),
                    ]);

                    $itemModel = \App\Models\Item::find($itemData['product']);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $qty = (float) str_replace(',', '', $itemData['qty'] ?? 1);
                        $itemModel->increment('quantity_on_hand', $qty);
                    }
                }

                // 2. Update Financial Truth (Journal Entry)
                $journalEntry->update([
                    'date' => $request->creditNoteDate,
                    'reference' => $request->creditNoteNo,
                    'description' => $request->memo,
                    'payee_id' => $request->customer,
                    'total_amount' => $totalAmount,
                ]);

                // Recreate lines
                $journalEntry->lines->each->delete();

                // Credit Accounts Receivable (Reduce balance)
                $arAccount = ChartOfAcc::getOrCreateDefault('accounts-receivable');
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $arAccount->id,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);

                // Debit Income / Returns account
                foreach ($request->items as $itemData) {
                    $itemModel = Item::find($itemData['product']);
                    $incomeAccount = $itemModel?->income_account_id ?? (ChartOfAcc::where('account_type', 'income')->first()?->id ?? ChartOfAcc::getOrCreateDefault('uncategorized-income')->id);

                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $incomeAccount,
                        'debit' => (float) str_replace(',', '', $itemData['amount']),
                        'credit' => 0,
                        'memo' => $itemData['description'] ?? $request->memo,
                    ]);
                }
            });

            $action = $request->input('action', 'save');
            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Sales Return updated successfully.');
            } elseif ($action === 'new') {
                return redirect()->route('credit-note')->with('success', 'Sales Return updated successfully.');
            }

            return redirect()->route('credit-note.edit', $journalEntry->id)->with('success', 'Sales Return updated successfully.');

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
            $creditNote = CreditNote::find($journalEntry->transactionable_id);

            if ($creditNote) {
                foreach ($creditNote->items as $oldItem) {
                    $itemModel = \App\Models\Item::find($oldItem->item_id);
                    if ($itemModel && $itemModel->type === 'inventory') {
                        $itemModel->decrement('quantity_on_hand', $oldItem->quantity);
                    }
                }
                $creditNote->items()->delete();
                $creditNote->delete();
            }

            $journalEntry->lines->each->delete();
            $journalEntry->delete();
        });
        if ($chartOfAccountId) {
            return redirect()->route('chart-of-account.history', ['chart_of_account' => $chartOfAccountId])
                ->with('success', 'Sales Return deleted successfully.');
        }

        return redirect()->route('chart-of-account.index')
            ->with('success', 'Sales Return deleted successfully.');
    }

    public function print(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $creditNote = CreditNote::with('items.item', 'customer', 'company')->findOrFail($journalEntry->transactionable_id);
        $company = $creditNote->company;

        $tableItems = [];
        foreach ($creditNote->items as $item) {
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
            ->where('document_type', 'credit_note')
            ->first();

        return view('print.document', [
            'title' => $printSetting?->custom_title ?: 'Credit Note',
            'headerAlignment' => $printSetting?->header_alignment ?: 'left',
            'staticFooterContent' => $printSetting?->static_footer_content ?: null,
            'layoutConfig' => $printSetting?->layout_config,
            'primaryColor' => $printSetting?->primary_color,
            'textColor' => $printSetting?->text_color,
            'pageSetup' => $printSetting?->page_setup,
            'blockStyles' => $printSetting?->block_styles,
            'documentNo' => $journalEntry->reference,
            'date' => $creditNote->credit_note_date,
            'dueDate' => null,
            'partyLabel' => 'Credit To',
            'partyName' => $creditNote->customer->display_name ?? $creditNote->customer->company_name,
            'partyAddress' => '',
            'partyEmail' => $creditNote->email ?? '',
            'tableHeaders' => ['Description', 'Qty', 'Rate', 'Amount'],
            'tableItems' => $tableItems,
            'totalAmount' => $creditNote->total_amount,
            'memo' => $creditNote->memo,
            'statementMessage' => $creditNote->statement_message,
            'company' => $company,
        ]);
    }

    private function getNextNo()
    {
        $last = CreditNote::query()->latest()->first();
        return $last ? (int)$last->creditNoteNo + 1 : 1001;
    }
}
