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
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CreditNoteController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/CreditNoteForm', [
            'nextCreditNoteNo' => $this->getNextNo()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer' => 'required',
            'creditNoteDate' => 'required|date',
            'creditNoteNo' => 'required',
            'items' => 'required|array|min:1',
        ]);

        DB::transaction(function() use ($request) {
            $totalAmount = collect($request->items)->sum(function($item) {
                return (float) str_replace(',', '', $item['amount']);
            });

            // 1. Business Details
            $creditNote = CreditNote::create([
                'company_id' => session('active_company_id'),
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
                    'description' => $itemData['description'],
                    'quantity' => $itemData['qty'] ?? 1,
                    'rate' => $itemData['rate'] ?? 0,
                    'amount' => (float) str_replace(',', '', $itemData['amount']),
                ]);
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
        });

        return redirect()->route('dashboard')->with('success', 'Sales Return saved successfully.');
    }

    private function getNextNo()
    {
        $last = CreditNote::where('company_id', session('active_company_id'))->latest()->first();
        return $last ? (int)$last->creditNoteNo + 1 : 1001;
    }
}
