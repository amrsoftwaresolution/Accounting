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
use App\Http\Requests\Accounting\StoreReceivePaymentRequest;
use App\Http\Requests\Accounting\UpdateReceivePaymentRequest;

class ReceivePaymentController extends Controller
{
    public function create(Request $request)
    {
        $lastRef = JournalEntry::where('transaction_type', 'payment')
            ->whereNotNull('reference')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->first();

        $nextPaymentNo = ($lastRef && is_numeric($lastRef->reference)) ? (int) $lastRef->reference + 1 : 1001;
        $nextPaymentNoLabel = (string) str_pad($nextPaymentNo, 4, '0', STR_PAD_LEFT);

        if ($copyId = $request->query('copy')) {
            $journalEntry = JournalEntry::findOrFail($copyId);
            $payment = \App\Models\Payment::find($journalEntry->transactionable_id);

            if (!$payment) {
                abort(404, 'Payment not found');
            }

            $paymentData = [
                'id' => null,
                'payment_id' => null,
                'customer' => $payment->customer_id,
                'email' => $payment->customer->email ?? '',
                'amountReceived' => number_format($payment->amount, 2, '.', ''),
                'paymentDate' => $payment->payment_date,
                'paymentMethod' => $payment->payment_method_id,
                'depositTo' => $payment->deposit_to_account_id,
                'referenceNo' => $nextPaymentNoLabel,
                'memo' => $payment->memo,
            ];

            $companyId = session('active_company_id');
            $paymentMethods = PaymentMethod::withoutGlobalScopes()
                ->where('is_active', true)
                ->where(function ($query) use ($companyId) {
                    $query->whereNull('company_id');
                    if ($companyId) {
                        $query->orWhere('company_id', $companyId);
                    }
                })
                ->orderBy('name')
                ->get();

            return Inertia::render('Transaction/ReceivePaymentForm', [
                'payment' => $paymentData,
                'paymentMethods' => $paymentMethods,
                'nextPaymentNo' => $nextPaymentNoLabel,
            ]);
        }

        $companyId = session('active_company_id');

        $paymentMethods = PaymentMethod::withoutGlobalScopes()
            ->where('is_active', true)
            ->where(function ($query) use ($companyId) {
                $query->whereNull('company_id');

                if ($companyId) {
                    $query->orWhere('company_id', $companyId);
                }
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Transaction/ReceivePaymentForm', [
            'paymentMethods' => $paymentMethods,
            'nextPaymentNo' => $nextPaymentNoLabel,
        ]);
    }

    public function store(StoreReceivePaymentRequest $request)
    {
        $validated = $request->validated();

        try {
            $journalEntry = DB::transaction(function() use ($request) {
                $amount = (float) str_replace(',', '', $request->amountReceived);

                // 1. Create Business Document (Payment)
                $payment = \App\Models\Payment::create([
                    'company_id' => session('active_company_id'),
                    'customer_id' => $request->customer,
                    'amount' => $amount,
                    'payment_date' => $request->paymentDate,
                    'payment_method_id' => $request->paymentMethod,
                    'deposit_to_account_id' => $request->depositTo,
                    'currency_id' => $request->currency_id,
                    'exchange_rate' => $request->exchange_rate,
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
                $arAccount = ChartOfAcc::getOrCreateDefault('accounts-receivable');
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $arAccount->id,
                    'debit' => 0,
                    'credit' => $amount,
                    'memo' => $request->memo,
                ]);

                return $journalEntry;
            });

            $action = $request->input('action', 'save');
            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Payment received successfully.');
            }

            if ($action === 'new') {
                return redirect()->route('payment')->with('success', 'Payment received successfully.');
            }

            $companyId = session('active_company_id');
            $paymentMethods = PaymentMethod::withoutGlobalScopes()
                ->where('is_active', true)
                ->where(function ($query) use ($companyId) {
                    $query->whereNull('company_id');
                    if ($companyId) {
                        $query->orWhere('company_id', $companyId);
                    }
                })
                ->orderBy('name')
                ->get();

            return redirect()->route('payment.edit', $journalEntry->id)->with('success', 'Payment received successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $payment = \App\Models\Payment::find($journalEntry->transactionable_id);

        if (!$payment) {
            abort(404, 'Payment not found');
        }

        $paymentData = [
            'id' => $journalEntry->id,
            'payment_id' => $payment->id,
            'customer' => $payment->customer_id,
            'email' => $payment->customer->email ?? '',
            'amountReceived' => number_format($payment->amount, 2, '.', ''),
            'paymentDate' => $payment->payment_date,
            'paymentMethod' => $payment->payment_method_id,
            'depositTo' => $payment->deposit_to_account_id,
            'referenceNo' => $payment->reference_no,
            'memo' => $payment->memo,
        ];

        $companyId = session('active_company_id');

        $paymentMethods = PaymentMethod::withoutGlobalScopes()
            ->where('is_active', true)
            ->where(function ($query) use ($companyId) {
                $query->whereNull('company_id');

                if ($companyId) {
                    $query->orWhere('company_id', $companyId);
                }
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Transaction/ReceivePaymentForm', [
            'payment' => $paymentData,
            'paymentMethods' => $paymentMethods
        ]);
    }

    public function update(UpdateReceivePaymentRequest $request, JournalEntry $journalEntry)
    {
        $validated = $request->validated();

        try {
            DB::transaction(function() use ($request, $journalEntry) {
                $amount = (float) str_replace(',', '', $request->amountReceived);

                // 1. Update Business Document (Payment)
                $payment = \App\Models\Payment::find($journalEntry->transactionable_id);
                if (!$payment) {
                    throw new \Exception('Payment document not found');
                }

                $payment->update([
                    'customer_id' => $request->customer,
                    'amount' => $amount,
                    'payment_date' => $request->paymentDate,
                    'payment_method_id' => $request->paymentMethod,
                    'deposit_to_account_id' => $request->depositTo,
                    'currency_id' => $request->currency_id,
                    'exchange_rate' => $request->exchange_rate,
                    'reference_no' => $request->referenceNo,
                    'memo' => $request->memo,
                ]);

                // 2. Re-create Allocations
                $payment->allocations()->delete();
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

                // 3. Update Financial Truth (Journal Entry)
                $journalEntry->update([
                    'date' => $request->paymentDate,
                    'reference' => $request->referenceNo,
                    'description' => $request->memo,
                    'payee_id' => $request->customer,
                    'total_amount' => $amount,
                ]);

                // Re-create lines
                $journalEntry->lines->each->delete();

                // Cash/Bank Account (Debit)
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $request->depositTo,
                    'debit' => $amount,
                    'credit' => 0,
                    'memo' => $request->memo,
                ]);

                // Accounts Receivable (Credit)
                $arAccount = ChartOfAcc::getOrCreateDefault('accounts-receivable');
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $arAccount->id,
                    'debit' => 0,
                    'credit' => $amount,
                    'memo' => $request->memo,
                ]);
            });

            $action = $request->input('action', 'save');
            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Payment updated successfully.');
            }

            if ($action === 'new') {
                return redirect()->route('payment')->with('success', 'Payment updated successfully.');
            }

            $companyId = session('active_company_id');
            $paymentMethods = PaymentMethod::withoutGlobalScopes()
                ->where('is_active', true)
                ->where(function ($query) use ($companyId) {
                    $query->whereNull('company_id');
                    if ($companyId) {
                        $query->orWhere('company_id', $companyId);
                    }
                })
                ->orderBy('name')
                ->get();

            return redirect()->route('payment.edit', $journalEntry->id)->with('success', 'Payment updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(JournalEntry $journalEntry)
    {
        $chartOfAccountId = $journalEntry->lines->first()?->chart_of_acc_id
            ?? $journalEntry->lines->first()?->chart_of_account_id
            ?? $journalEntry->lines->first()?->account_id;

        DB::transaction(function () use ($journalEntry) {
            $payment = \App\Models\Payment::find($journalEntry->transactionable_id);

            if ($payment) {
                $payment->allocations()->delete();
                $payment->delete();
            }

            $journalEntry->lines->each->delete();
            $journalEntry->delete();
        });

        if ($chartOfAccountId) {
            return redirect()->route('chart-of-account.history', ['chart_of_account' => $chartOfAccountId])
                ->with('success', 'Payment deleted successfully.');
        }

        return redirect()->route('dashboard')
            ->with('success', 'Payment deleted successfully.');
    }
}
