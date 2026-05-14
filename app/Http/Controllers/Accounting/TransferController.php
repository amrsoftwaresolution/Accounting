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

class TransferController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/TransferForm', [
            'lastTransferDate' => session('last_transfer_date'),
            'lastSaveAction' => session('last_save_action_transfer', 'save'),
        ]);
    }

    public function store(Request $request)
    {
        // FIX 3: Changed keys to match your frontend (transfer_from, transfer_to)
        $validated = $request->validate([
            'transfer_from' => 'required|uuid|exists:chart_of_accs,id',
            'transfer_to'   => 'required|uuid|exists:chart_of_accs,id|different:transfer_from',
            'amount'        => 'required|numeric|min:0.01',
            'date'          => 'required|date',
            'memo'          => 'nullable|string',
        ]);

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

            $action = $request->input('action', 'save');
            session(['last_transfer_date' => $request->date, 'last_save_action_transfer' => $action]);

            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Transfer saved successfully.');
            }

            return redirect()->back()->with('success', 'Transfer saved successfully.');

        } catch (\Exception $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
