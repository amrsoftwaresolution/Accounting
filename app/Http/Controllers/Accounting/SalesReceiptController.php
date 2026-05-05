<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Item;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;
use App\Models\SalesReceipt;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SalesReceiptController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/SalesReceipt', [
            'customers' => Customer::orderBy('display_name')->get(),
            'products' => Item::orderBy('name')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get(),
            'depositAccounts' => ChartOfAcc::orderBy('account_code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|uuid',
            'email' => 'nullable|email',
            'billing_address' => 'nullable|string',
            'date' => 'required|date',
            'payment_method' => 'nullable|uuid',
            'reference_no' => 'nullable|string|max:100',
            'deposit_to' => 'nullable|integer',
            'receipt_no' => 'required|string|max:50',
            'message_on_receipt' => 'nullable|string',
            'message_on_statement' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.description' => 'nullable|string',
            'items.*.qty' => 'required|numeric|min:0',
            'items.*.rate' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        $totalAmount = collect($validated['items'])->sum(fn ($item) => (float) $item['amount']);

        SalesReceipt::create([
            'id' => (string) Str::uuid(),
            'customer_id' => $validated['customer_id'],
            'email' => $validated['email'],
            'billing_address' => $validated['billing_address'],
            'date' => $validated['date'],
            'payment_method' => $validated['payment_method'],
            'reference_no' => $validated['reference_no'],
            'deposit_to' => $validated['deposit_to'],
            'receipt_no' => $validated['receipt_no'],
            'message_on_receipt' => $validated['message_on_receipt'],
            'message_on_statement' => $validated['message_on_statement'],
            'items' => $validated['items'],
            'total_amount' => $totalAmount,
        ]);

        return back()->with('message', 'Sales receipt saved successfully.');
    }
}
