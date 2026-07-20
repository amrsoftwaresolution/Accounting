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
        return Inertia::render('Transaction/PayBill', [
            'paymentMethods' => $this->paymentMethods()
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

        return redirect()->route('dashboard')
            ->with('success', 'Bill Payment deleted successfully.');
    }

    public function print(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $payment = BillPayment::with('supplier', 'company', 'allocations.bill')->findOrFail($journalEntry->transactionable_id);
        $company = $payment->company;

        $tableItems = [];
        if ($payment->allocations && $payment->allocations->count() > 0) {
            foreach ($payment->allocations as $alloc) {
                $tableItems[] = [
                    "Payment applied to Bill #" . ($alloc->bill->bill_no ?? 'Unknown'),
                    ($company->home_currency_prefix ?? 'LKR ') . number_format($alloc->amount_applied, 2),
                ];
            }
        } else {
            $tableItems[] = [
                "Payment to Supplier",
                ($company->home_currency_prefix ?? 'LKR ') . number_format($payment->amount, 2),
            ];
        }

        $printSetting = \App\Models\PrintSetting::query()
            ->where('document_type', 'payment_voucher')
            ->first();

        return view('print.document', [
            'title' => $printSetting?->custom_title ?: 'Payment Voucher',
            'headerAlignment' => $printSetting?->header_alignment ?: 'left',
            'staticFooterContent' => $printSetting?->static_footer_content ?: null,
            'layoutConfig' => $printSetting?->layout_config,
            'primaryColor' => $printSetting?->primary_color,
            'textColor' => $printSetting?->text_color,
            'pageSetup' => $printSetting?->page_setup,
            'blockStyles' => $printSetting?->block_styles,
            'documentNo' => $payment->reference_no,
            'date' => $payment->payment_date,
            'dueDate' => null,
            'partyLabel' => 'Paid To',
            'partyName' => $payment->supplier->display_name ?? $payment->supplier->company_name,
            'partyAddress' => '',
            'partyEmail' => $payment->supplier->email ?? '',
            'tableHeaders' => ['Description', 'Amount'],
            'tableItems' => $tableItems,
            'totalAmount' => $payment->amount,
            'memo' => $payment->memo,
            'statementMessage' => null,
            'company' => $company,
        ]);
    }
}
