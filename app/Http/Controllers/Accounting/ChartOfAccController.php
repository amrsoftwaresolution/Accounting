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
            'lastOpeningBalanceDate' => session('last_opening_balance_date', date('Y-m-d')),
        ]);
    }

    public function store(Request $request)
    {
        // Strip commas from opening_balance if present
        if ($request->has('opening_balance')) {
            $request->merge([
                'opening_balance' => str_replace(',', '', $request->input('opening_balance'))
            ]);
        }

        $request->validate([
            'account_code' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('chart_of_accs', 'account_code')->where(function ($query) {
                    return $query->where('company_id', session('active_company_id'));
                })
            ],
            'name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'sub_type' => 'nullable|string|max:255',
            'opening_balance' => 'nullable|numeric',
            'opening_balance_date' => 'nullable|date',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'currency' => 'nullable|string|max:3',
            'parent_id' => 'nullable|uuid|exists:chart_of_accs,id',
            'is_locked' => 'nullable|boolean',
        ]);

        if ($request->filled('opening_balance_date')) {
            session(['last_opening_balance_date' => $request->input('opening_balance_date')]);
        }

        $company = \App\Models\Company::findOrFail(session('active_company_id'));
        $selectedCurrency = $request->input('currency');
        $currencyToSave = ($selectedCurrency === $company->home_currency) ? null : $selectedCurrency;

        $account = ChartOfAcc::create([
            'company_id' => $company->id,
            'account_code' => $request->input('account_code'),
            'name' => $request->input('name'),
            'account_type' => $request->input('account_type'),
            'sub_type' => $request->input('sub_type'),
            'balance' => 0,
            'description' => $request->input('description'),
            'is_active' => $request->boolean('is_active', true),
            'currency' => $currencyToSave,
            'parent_id' => $request->input('is_subaccount') ? $request->input('parent_id') : null,
            'is_locked' => $request->boolean('is_locked', false),
        ]);

        // If opening balance > 0, create a Journal Entry
        // Only allow opening balance for Asset, Liability, and Equity
        $openingBalance = (float) $request->input('opening_balance', 0);
        $canHaveOpeningBalance = in_array($account->account_type, ['asset', 'liability', 'equity']);

        if ($openingBalance != 0 && $canHaveOpeningBalance) {
            $equityAccount = ChartOfAcc::firstOrCreate(
                [
                    'company_id' => $company->id,
                    'name' => 'Opening Balance Equity'
                ],
                [
                    'account_code' => '3000', // Typical equity code
                    'account_type' => 'equity',
                    'sub_type' => 'owners-equity',
                    'is_active' => true,
                ]
            );

            $journalEntry = \App\Models\JournalEntry::create([
                'company_id' => $company->id,
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

        return redirect()->back()->with([
            'success' => 'Chart of account created successfully.',
            'new_account' => [
                'value' => $account->id,
                'label' => "{$account->account_code} - {$account->name}"
            ]
        ]);
    }

    public function update(Request $request, ChartOfAcc $chartOfAccount)
    {
        if ($chartOfAccount->is_locked) {
            // Only allow updates if we are explicitly unlocking it
            if (!($request->has('is_locked') && !$request->boolean('is_locked'))) {
                return redirect()->back()->with('error', 'This account is locked and cannot be modified.');
            }
        }

        // Handle status toggle (active/inactive) from row action dropdown
        if ($request->has('is_active') && !$request->has('name')) {
            $chartOfAccount->update([
                'is_active' => $request->boolean('is_active')
            ]);
            return redirect()->route('chart-of-account.index')->with('success', 'Account status updated successfully.');
        }

        // Handle lock toggle from row action dropdown
        if ($request->has('is_locked') && !$request->has('name')) {
            $chartOfAccount->update([
                'is_locked' => $request->boolean('is_locked')
            ]);
            $statusText = $chartOfAccount->is_locked ? 'locked' : 'unlocked';
            return redirect()->route('chart-of-account.index')->with('success', "Account {$statusText} successfully.");
        }

        $request->validate([
            'account_code' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('chart_of_accs', 'account_code')
                    ->ignore($chartOfAccount->id)
                    ->where(function ($query) {
                        return $query->where('company_id', session('active_company_id'));
                    })
            ],
            'name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'sub_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'currency' => 'nullable|string|max:3',
            'parent_id' => [
                'nullable',
                'uuid',
                'exists:chart_of_accs,id',
                function ($attribute, $value, $fail) use ($chartOfAccount) {
                    if ($value === $chartOfAccount->id) {
                        $fail('An account cannot be its own parent account.');
                    }
                }
            ],
            'is_locked' => 'nullable|boolean',
        ]);

        $company = \App\Models\Company::findOrFail(session('active_company_id'));
        $selectedCurrency = $request->input('currency');
        $currencyToSave = ($selectedCurrency === $company->home_currency) ? null : $selectedCurrency;

        $chartOfAccount->update([
            'account_code' => $request->input('account_code'),
            'name' => $request->input('name'),
            'account_type' => $request->input('account_type'),
            'sub_type' => $request->input('sub_type'),
            'description' => $request->input('description'),
            'currency' => $currencyToSave,
            'parent_id' => $request->input('is_subaccount') ? $request->input('parent_id') : null,
            'is_locked' => $request->boolean('is_locked', false),
        ]);

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account updated successfully.');
    }

    public function history(ChartOfAcc $chartOfAccount)
    {
        if (!in_array($chartOfAccount->account_type, ['asset', 'liability', 'equity'])) {
            return redirect()->route('reports.profit-loss')->with('error', 'History is only available for Asset, Liability, and Equity accounts.');
        }

        $lines = \App\Models\JournalEntryLine::with(['journalEntry.creator', 'journalEntry.lines.account'])
             ->where('chart_of_acc_id', $chartOfAccount->id)
             ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
             ->orderBy('journal_entries.date', 'desc')
             ->select('journal_entry_lines.*')
             ->get();

        $accounts = ChartOfAcc::orderBy('account_code')->get();

        return Inertia::render('Accounting/AccountHistory', [
            'account' => $chartOfAccount,
            'lines' => $lines,
            'accounts' => $accounts,
        ]);
    }

    public function destroy(ChartOfAcc $chartOfAccount)
    {
        if ($chartOfAccount->is_locked) {
            return redirect()->back()->with('error', 'This account is locked and cannot be deleted.');
        }

        $chartOfAccount->delete();

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account deleted successfully.');
    }
}
