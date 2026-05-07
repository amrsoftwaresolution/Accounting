<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use App\Models\Bill;
use App\Models\BillItem;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    public function create()
    {
        $companyId = session('active_company_id');

        // Fetch suppliers and accounts for the active company
        $suppliers = Supplier::where('company_id', $companyId)->orderBy('display_name')->get();
        $accounts = ChartOfAcc::where('company_id', $companyId)->orderBy('account_code')->get();

        // Generate next Bill Number
        $lastRef = JournalEntry::where('company_id', $companyId)
            ->where('transaction_type', 'bill')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->value('reference');

        $nextBillNo = is_numeric($lastRef) ? (int)$lastRef + 1 : 1001;

        return Inertia::render('Transaction/BillForm', [
            'suppliers' => $suppliers,
            'accounts' => $accounts,
            'nextBillNo' => (string)str_pad($nextBillNo, 4, '0', STR_PAD_LEFT)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier' => 'required',
            'billDate' => 'required|date',
            'billNo' => 'required',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required',
            'items.*.amount' => 'required|numeric',
        ]);

        try {
            DB::transaction(function() use ($request) {
                $companyId = session('active_company_id');

                $totalAmount = collect($request->items)->sum(function($item) {
                    return (float) $item['amount'];
                });

                // 1. Create the Bill
                $bill = Bill::create([
                    'company_id' => $companyId,
                    'supplier_id' => $request->supplier,
                    'bill_date' => $request->billDate,
                    'due_date' => $request->dueDate,
                    'bill_no' => $request->billNo,
                    'total_amount' => $totalAmount,
                    'memo' => $request->memo,
                    'status' => 'posted',
                ]);

                // 2. Create Bill Items
                foreach ($request->items as $lineItem) {
                    BillItem::create([
                        'bill_id' => $bill->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'description' => $lineItem['description'] ?? '',
                        'amount' => $lineItem['amount'],
                    ]);
                }

                // 3. Create the Journal Entry
                $journalEntry = JournalEntry::create([
                    'company_id' => $companyId,
                    'date' => $request->billDate,
                    'reference' => $request->billNo,
                    'description' => $request->memo,
                    'transaction_type' => 'bill',
                    'payee_id' => $request->supplier,
                    'payee_type' => Supplier::class,
                    'total_amount' => $totalAmount,
                    'status' => 'posted',
                    'created_by' => Auth::id(),
                    'transactionable_id' => $bill->id,
                    'transactionable_type' => Bill::class,
                ]);

                // Debits (Expenses)
                foreach ($request->items as $lineItem) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $lineItem['category'],
                        'debit' => $lineItem['amount'],
                        'credit' => 0,
                        'memo' => $lineItem['description'] ?? $request->memo,
                    ]);
                }

                // Credit (Accounts Payable)
                $apAccount = ChartOfAcc::where('company_id', $companyId)
                    ->where('sub_type', 'accounts-payable')
                    ->first();

                if (!$apAccount) {
                    throw new \Exception("Accounts Payable account not found.");
                }

                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $apAccount->id,
                    'debit' => 0,
                    'credit' => $totalAmount,
                    'memo' => $request->memo,
                ]);
            });

            return redirect()->route('bill.create')->with('success', 'Bill saved successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
