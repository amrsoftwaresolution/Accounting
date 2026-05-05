<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReceivePaymentController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/ReceivePaymentForm', [
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer' => 'required',
            'amountReceived' => 'required',
            'paymentDate' => 'required|date',
            'depositTo' => 'required',
        ]);

        DB::transaction(function() use ($request) {
            $amount = (float) str_replace(',', '', $request->amountReceived);

            // 1. Create Business Document (Payment)
            $payment = \App\Models\Payment::create([
                'company_id' => session('active_company_id'),
                'customer_id' => $request->customer,
                'amount' => $amount,
                'payment_date' => $request->paymentDate,
                'payment_method_id' => $request->paymentMethod,
                'deposit_to_account_id' => $request->depositTo,
                'reference_no' => $request->referenceNo,
                'memo' => $request->memo,
            ]);

            // Allocations (Business Details)
            if ($request->has('invoices')) {
                foreach ($request->invoices as $inv) {
                    if ((float)$inv['amount'] > 0) {
                        \App\Models\PaymentAllocation::create([
                            'payment_id' => $payment->id,
                            'invoice_id' => $inv['id'],
                            'amount' => (float)$inv['amount'],
                        ]);
                    }
                }
            }

            // 2. Create Financial Truth (Journal Entry)
            $journalEntry = JournalEntry::create([
                'date' => $request->paymentDate,
                'reference' => $request->referenceNo,
                'description' => $request->memo,
                'transaction_type' => 'payment',
                'payee_id' => $request->customer,
                'payee_type' => Customer::class,
                'total_amount' => $amount,
                'status' => 'posted',
                'created_by' => Auth::id(),
                'transactionable_id' => $payment->id,
                'transactionable_type' => \App\Models\Payment::class,
            ]);

            // Cash/Bank Account (Debit)
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->depositTo,
                'debit' => $amount,
                'credit' => 0,
                'memo' => $request->memo,
            ]);

            // Accounts Receivable (Credit)
            $arAccount = ChartOfAcc::where('sub_type', 'accounts-receivable')->first();
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $arAccount->id,
                'debit' => 0,
                'credit' => $amount,
                'memo' => $request->memo,
            ]);
        });

        return redirect()->back()->with('success', 'Payment received successfully.');
    }
}
