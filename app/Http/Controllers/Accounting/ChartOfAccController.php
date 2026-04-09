<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\ChartOfAcc;

class ChartOfAccController extends Controller
{

    public function index()
    {
        $chartOfAccounts = ChartOfAcc::orderBy('account_type')->orderBy('account_code')->get();

        return Inertia::render('Accounting/chart-of-acc-index', [
            'chartOfAccounts' => $chartOfAccounts,
        ]);
    }


    public function create()
    {
        return Inertia::render('Accounting/chart-of-acc-create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'account_code' => 'required|string|max:255|unique:chart_of_accs,account_code',
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'account_sub_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        ChartOfAcc::create([
            'team_id' => null,
            'account_code' => $request->input('account_code'),
            'account_name' => $request->input('account_name'),
            'account_type' => $request->input('account_type'),
            'account_sub_type' => $request->input('account_sub_type'),
            'description' => $request->input('description'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account created successfully.');
    }

    public function show(ChartOfAcc $chartOfAccount)
    {
        return Inertia::render('Accounting/chart-of-acc-show', [
            'chartOfAccount' => $chartOfAccount,
        ]);
    }

    public function edit(ChartOfAcc $chartOfAccount)
    {
        return Inertia::render('Accounting/chart-of-acc-edit', [
            'chartOfAccount' => $chartOfAccount,
        ]);
    }

    public function update(Request $request, ChartOfAcc $chartOfAccount)
    {
        $request->validate([
            'account_code' => 'required|string|max:255|unique:chart_of_accs,account_code,' . $chartOfAccount->id,
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'account_sub_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $chartOfAccount->update([
            'account_code' => $request->input('account_code'),
            'account_name' => $request->input('account_name'),
            'account_type' => $request->input('account_type'),
            'account_sub_type' => $request->input('account_sub_type'),
            'description' => $request->input('description'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account updated successfully.');
    }

    public function destroy(ChartOfAcc $chartOfAccount)
    {
        $chartOfAccount->delete();

        return redirect()->route('chart-of-account.index')->with('success', 'Chart of account deleted successfully.');
    }
}
