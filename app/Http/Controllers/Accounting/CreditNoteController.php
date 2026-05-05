<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\ChartOfAcc;
use App\Models\CreditNote;
use App\Models\CreditNoteLine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreditNoteController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/CreditNote', [
            'customers' => Customer::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'email' => 'nullable|email',
            'billing_address' => 'nullable|string',
            'date' => 'required|date',
            'credit_note_no' => 'nullable|string|max:255',
            'message_on_note' => 'nullable|string',
            'message_on_statement' => 'nullable|string',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'items' => 'required|array|min:1',
            'items.*.service_date' => 'nullable|date',
            'items.*.description' => 'nullable|string',
            'items.*.amount' => 'required|numeric|min:0.01',
        ]);

        // Calculate subtotal and total
        $subtotal = collect($validated['items'])->sum(fn($item) => (float) $item['amount']);
        $discountAmount = ($subtotal * ((float) $validated['discount_percent'] ?? 0)) / 100;
        $totalAmount = $subtotal - $discountAmount;

        // Create credit note
        $creditNote = CreditNote::create([
            'customer_id' => $validated['customer_id'],
            'email' => $validated['email'],
            'billing_address' => $validated['billing_address'],
            'date' => $validated['date'],
            'credit_note_no' => $validated['credit_note_no'],
            'message_on_note' => $validated['message_on_note'],
            'message_on_statement' => $validated['message_on_statement'],
            'discount_percent' => $validated['discount_percent'] ?? 0,
            'subtotal' => $subtotal,
            'total_amount' => $totalAmount,
        ]);

        // Create line items
        foreach ($validated['items'] as $item) {
            CreditNoteLine::create([
                'credit_note_id' => $creditNote->id,
                'service_date' => $item['service_date'],
                'description' => $item['description'],
                'amount' => $item['amount'],
            ]);
        }

        return redirect()->route('credit-note')
            ->with('success', 'Credit note created successfully.');
    }
}
