<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\ChartOfAcc;
use App\Models\SupplierCredit;
use App\Models\SupplierCreditLine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierCreditController extends Controller
{
    public function index()
    {
        return Inertia::render('Transaction/SupplierCredit', [
            'suppliers' => Supplier::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'date' => 'required|date',
            'ref' => 'nullable|string|max:255',
            'memo' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required|exists:chart_of_accs,id',
            'items.*.description' => 'nullable|string',
            'items.*.amount' => 'required|numeric|min:0.01',
        ]);

        // Calculate total amount
        $totalAmount = collect($validated['items'])
            ->sum(fn($item) => (float) $item['amount']);

        // Create supplier credit
        $credit = SupplierCredit::create([
            'supplier_id' => $validated['supplier_id'],
            'date' => $validated['date'],
            'ref' => $validated['ref'],
            'memo' => $validated['memo'],
            'total_amount' => $totalAmount,
        ]);

        // Create line items
        foreach ($validated['items'] as $item) {
            SupplierCreditLine::create([
                'supplier_credit_id' => $credit->id,
                'account_id' => $item['category'],
                'description' => $item['description'],
                'amount' => $item['amount'],
            ]);
        }

        return redirect()->route('SupplierCredit')
            ->with('success', 'Supplier credit created successfully.');
    }
}
