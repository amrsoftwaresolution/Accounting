<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\ChartOfAcc;
use App\Models\User;
use Illuminate\Support\Facades\Auth;


class ChartOfAccController extends Controller
{

    public function index()
    {
        $chartOfAccounts = ChartOfAcc::orderBy('account_type')->orderBy('account_code')->get();

        return Inertia::render('Accounting/chart-of-acc-index', [
            'chartOfAccounts' => $chartOfAccounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'account_code' => 'required|string|max:255|unique:chart_of_accs,account_code',
            'name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'sub_type' => 'nullable|string|max:255',
            'opening_balance' => 'nullable|numeric',
            'opening_balance_date' => 'nullable|date',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $account = ChartOfAcc::create([
            'account_code' => $request->input('account_code'),
            'name' => $request->input('name'),
            'account_type' => $request->input('account_type'),
            'sub_type' => $request->input('sub_type'),
            'balance' => $request->input('opening_balance', 0), // Initial balance, will be adjusted by Journal Entry if we want strict JE tracking
            'description' => $request->input('description'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        // If opening balance > 0, create a Journal Entry
        $openingBalance = (float) $request->input('opening_balance', 0);
        if ($openingBalance != 0) {
            $equityAccount = ChartOfAcc::firstOrCreate(
                ['name' => 'Opening Balance Equity'],
                [
                    'account_code' => '3000', // Typical equity code
                    'account_type' => 'equity',
                    'sub_type' => 'owners-equity',
                    'is_active' => true,
                ]
            );

            $journalEntry = \App\Models\JournalEntry::create([
                'date' => $request->input('opening_balance_date', now()),
                'reference' => 'OPENING_BAL',
                'description' => 'Opening balance for ' . $account->name,
                'transaction_type' => 'opening_balance',
                'total_amount' => abs($openingBalance),
                'status' => 'posted',
                'created_by' => Auth::id(),
            ]);

            // Asset and Expense: Debit increases, Credit decreases
            // Liability, Equity, Income: Credit increases, Debit decreases
            $isDebitSide = in_array($account->account_type, ['asset', 'expense']);
            
            if ($openingBalance > 0) {
                $accountDebit = $isDebitSide ? $openingBalance : 0;
                $accountCredit = $isDebitSide ? 0 : $openingBalance;
                
                $equityDebit = $isDebitSide ? 0 : $openingBalance;
                $equityCredit = $isDebitSide ? $openingBalance : 0;
            } else {
                $accountDebit = $isDebitSide ? 0 : abs($openingBalance);
                $accountCredit = $isDebitSide ? abs($openingBalance) : 0;
                
                $equityDebit = $isDebitSide ? abs($openingBalance) : 0;
                $equityCredit = $isDebitSide ? 0 : abs($openingBalance);
            }

            $journalEntry->lines()->create([
                'chart_of_acc_id' => $account->id,
                'debit' => $accountDebit,
                'credit' => $accountCredit,
                'memo' => 'Opening balance',
            ]);

            $journalEntry->lines()->create([
                'chart_of_acc_id' => $equityAccount->id,
                'debit' => $equityDebit,
                'credit' => $equityCredit,
                'memo' => 'Opening balance offset',
            ]);
        }

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account created successfully.');
    }

    public function update(Request $request, ChartOfAcc $chartOfAccount)
    {
        $request->validate([
            'account_code' => 'required|string|max:255|unique:chart_of_accs,account_code,' . $chartOfAccount->id,
            'name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'sub_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $chartOfAccount->update([
            'account_code' => $request->input('account_code'),
            'name' => $request->input('name'),
            'account_type' => $request->input('account_type'),
            'sub_type' => $request->input('sub_type'),
            'description' => $request->input('description'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account updated successfully.');
    }

    public function history(ChartOfAcc $chartOfAccount)
    {
        $lines = \App\Models\JournalEntryLine::with(['journalEntry.creator'])
            ->where('chart_of_acc_id', $chartOfAccount->id)
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->orderBy('journal_entries.date', 'desc')
            ->select('journal_entry_lines.*')
            ->get();

        return Inertia::render('Accounting/AccountHistory', [
            'account' => $chartOfAccount,
            'lines' => $lines
        ]);
    }

    public function destroy(ChartOfAcc $chartOfAccount)
    {
        $chartOfAccount->delete();

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account deleted successfully.');
    }
}
