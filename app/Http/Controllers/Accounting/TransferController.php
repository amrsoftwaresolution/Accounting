<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAcc;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine; // FIX 1: Add this missing import
use App\Models\Transfer;         // FIX 2: Better to import the model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Accounting\StoreTransferRequest;

class TransferController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/TransferForm');
    }

    public function store(StoreTransferRequest $request)
    {
        $validated = $request->validated();

        try {
            DB::transaction(function() use ($request) {
                $amount = (float) $request->amount;

                // 1. Create Business Document (Transfer)
                $transfer = Transfer::create([
                    'company_id'      => session('active_company_id'),
                    'from_account_id' => $request->transfer_from, // Updated key
                    'to_account_id'   => $request->transfer_to,   // Updated key
                    'amount'          => $amount,
                    'date'            => $request->date,
                    'memo'            => $request->memo,
                    'reference_no'    => $request->referenceNo ?? 'TRF-' . time(), // Fallback if null
                ]);

                // 2. Create Financial Truth (Journal Entry)
                $journalEntry = JournalEntry::create([
                    'date'                => $request->date,
                    'reference'           => $transfer->reference_no,
                    'description'         => $request->memo,
                    'transaction_type'    => 'transfer',
                    'total_amount'        => $amount,
                    'status'              => 'posted',
                    'created_by'          => Auth::id(),
                    'transactionable_id'  => $transfer->id,
                    'transactionable_type' => Transfer::class,
                ]);

                // From Account (Credit - Money leaving Asset)
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id'  => $request->transfer_from,
                    'debit'            => 0,
                    'credit'           => $amount,
                    'memo'             => $request->memo,
                ]);

                // To Account (Debit - Money entering Asset)
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id'  => $request->transfer_to,
                    'debit'            => $amount,
                    'credit'           => 0,
                    'memo'             => $request->memo,
                ]);
            });

            return redirect()->back()->with('success', 'Transfer saved successfully.');

        } catch (\Exception $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
