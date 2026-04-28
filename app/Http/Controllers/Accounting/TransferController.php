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
        $request->validate([
            'date' => 'required|date',
            'transfer_from' => 'required|exists:chart_of_accs,id',
            'transfer_to' => 'required|exists:chart_of_accs,id|different:transfer_from',
            'amount' => 'required|numeric|min:0.01',
            'memo' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $entry = JournalEntry::create([
                'date' => $request->date,
                'reference' => 'TRF-' . time(),
                'description' => $request->memo ?: 'Funds Transfer',
                'transaction_type' => 'transfer',
                'total_amount' => $request->amount,
                'status' => 'posted',
                'created_by' => Auth::id(),
            ]);

            // Credit the source (decrease asset)
            $entry->lines()->create([
                'chart_of_acc_id' => $request->transfer_from,
                'debit' => 0,
                'credit' => $request->amount,
                'memo' => 'Transfer from source',
            ]);

            // Debit the destination (increase asset)
            $entry->lines()->create([
                'chart_of_acc_id' => $request->transfer_to,
                'debit' => $request->amount,
                'credit' => 0,
                'memo' => 'Transfer to destination',
            ]);

            // Update the actual balance columns in chart_of_accs
            // For Assets: Balance = Debit - Credit
            DB::table('chart_of_accs')
                ->where('id', $request->transfer_from)
                ->decrement('balance', $request->amount);

            DB::table('chart_of_accs')
                ->where('id', $request->transfer_to)
                ->increment('balance', $request->amount);

            return response()->json(['message' => 'Transfer successful', 'id' => $entry->id]);
        });
    }
}
