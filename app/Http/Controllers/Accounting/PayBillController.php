<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Supplier;
use App\Models\BillPayment;
use App\Models\BillPaymentAllocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PayBillController extends Controller
{
    public function create(Request $request)
    {
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

        return Inertia::render('Transaction/PayBill', [
            'paymentMethods' => $paymentMethods
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier' => 'required|uuid',
            'amount' => 'required|numeric|min:0.01',
            'paymentDate' => 'required|date',
            'paymentMethod' => 'nullable|uuid',
            'paymentAccount' => 'required|uuid',
            'referenceNo' => 'nullable|string|max:255',
            'memo' => 'nullable|string',
            'bills' => 'nullable|array',
            'bills.*.id' => 'required|uuid',
            'bills.*.amount' => 'required|numeric|min:0',
        ]);

        try {
            $journalEntry = DB::transaction(function() use ($request, $validated) {
                $amount = (float) $validated['amount'];

                $payment = BillPayment::create([
                    'company_id' => session('active_company_id'),
                    'supplier_id' => $request->supplier,
                    'amount' => $amount,
                    'payment_date' => $request->paymentDate,
                    'payment_method_id' => $request->paymentMethod,
                    'payment_account_id' => $request->paymentAccount,
                    'reference_no' => $request->referenceNo,
                    'memo' => $request->memo,
                ]);

                $totalAllocated = 0;
                if (!empty($request->bills)) {
                    foreach ($request->bills as $billData) {
                        $allocAmount = (float) $billData['amount'];
                        if ($allocAmount > 0) {
                            BillPaymentAllocation::create([
                                'bill_payment_id' => $payment->id,
                                'bill_id' => $billData['id'],
                                'amount_applied' => $allocAmount,
                            ]);
                            $totalAllocated += $allocAmount;

                            $bill = \App\Models\Bill::find($billData['id']);
                            if ($bill) {
                                $totalPaid = BillPaymentAllocation::where('bill_id', $bill->id)->sum('amount_applied');
                                if ($totalPaid >= $bill->total_amount - 0.01) {
                                    $bill->update(['status' => 'paid']);
                                } else {
                                    $bill->update(['status' => 'posted']);
                                }
                            }
                        }
                    }
                }

                $journalEntry = JournalEntry::create([
                    'date' => $request->paymentDate,
                    'reference' => $request->referenceNo,
                    'description' => $request->memo ?? 'Bill Payment',
                    'transaction_type' => 'pay_bill',
                    'transactionable_type' => BillPayment::class,
                    'transactionable_id' => $payment->id,
                    'total_amount' => $amount,
                    'status' => 'posted',
                    'created_by' => Auth::id(),
                    'company_id' => session('active_company_id'),
                ]);

                // Credit Bank Account (Money leaving)
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $request->paymentAccount,
                    'description' => $request->memo ?? 'Bill Payment',
                    'credit' => $amount,
                    'debit' => 0,
                ]);

                // Debit Accounts Payable
                $apAccount = ChartOfAcc::where('account_type', 'liability')
                    ->where('name', 'like', '%Accounts Payable%')
                    ->where('company_id', session('active_company_id'))
                    ->first();

                if (!$apAccount) {
                    $apAccount = ChartOfAcc::where('account_type', 'liability')->first();
                }

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id ?? ChartOfAcc::first()->id,
                    'description' => 'Payment for Bill(s)',
                    'debit' => $amount,
                    'credit' => 0,
                ]);

                return $journalEntry;
            });

            if ($request->action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Bill payment recorded successfully.');
            }

                return redirect()->route('pay-bill')->with('success', 'Bill payment recorded successfully.');

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
            $payment = BillPayment::find($journalEntry->transactionable_id);

            if ($payment) {
                $allocations = BillPaymentAllocation::where('bill_payment_id', $payment->id)->get();
                
                foreach ($allocations as $allocation) {
                    $billId = $allocation->bill_id;
                    $allocation->delete();
                    
                    // Re-evaluate bill status
                    $bill = \App\Models\Bill::find($billId);
                    if ($bill) {
                        $totalPaid = BillPaymentAllocation::where('bill_id', $bill->id)->sum('amount_applied');
                        if ($totalPaid >= $bill->total_amount - 0.01) {
                            $bill->update(['status' => 'paid']);
                        } else {
                            $bill->update(['status' => 'posted']);
                        }
                    }
                }
                $payment->delete();
            }

            $journalEntry->lines()->delete();
            $journalEntry->delete();
        });

        if ($chartOfAccountId) {
            return redirect()->route('chart-of-account.history', ['chart_of_account' => $chartOfAccountId])
                ->with('success', 'Bill Payment deleted successfully.');
        }

        return redirect()->route('chart-of-account.index')
            ->with('success', 'Bill Payment deleted successfully.');
    }
}
