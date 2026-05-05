<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAcc;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TransferController extends Controller
{
    public function create()
    {
        $accounts = ChartOfAcc::where('sub_type', 'cash-and-cash-equivalents')
            ->orderBy('account_code')
            ->get();

        return Inertia::render('Transaction/TransferForm', [
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fromAccount' => 'required',
            'toAccount' => 'required',
            'amount' => 'required',
            'date' => 'required|date',
        ]);

        DB::transaction(function() use ($request) {
            $amount = (float) str_replace(',', '', $request->amount);

            // 1. Create Business Document (Transfer)
            $transfer = \App\Models\Transfer::create([
                'company_id' => session('active_company_id'),
                'from_account_id' => $request->fromAccount,
                'to_account_id' => $request->toAccount,
                'amount' => $amount,
                'date' => $request->date,
                'memo' => $request->memo,
                'reference_no' => $request->referenceNo,
            ]);

            // 2. Create Financial Truth (Journal Entry)
            $journalEntry = JournalEntry::create([
                'date' => $request->date,
                'reference' => $request->referenceNo,
                'description' => $request->memo,
                'transaction_type' => 'transfer',
                'total_amount' => $amount,
                'status' => 'posted',
                'created_by' => Auth::id(),
                'transactionable_id' => $transfer->id,
                'transactionable_type' => \App\Models\Transfer::class,
            ]);

            // From Account (Credit)
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->fromAccount,
                'debit' => 0,
                'credit' => $amount,
                'memo' => $request->memo,
            ]);

            // To Account (Debit)
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->toAccount,
                'debit' => $amount,
                'credit' => 0,
                'memo' => $request->memo,
            ]);
        });

        return redirect()->back()->with('success', 'Transfer saved successfully.');
    }
}
