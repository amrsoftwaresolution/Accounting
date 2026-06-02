<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;
use App\Models\BankDeposit;
use App\Models\BankDepositItem;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Http\Requests\Accounting\StoreBankDepositRequest;

class BankDepositController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/BankDepositForm', [
            'nextDepositNo' => $this->getNextDepositNo()
        ]);
    }

    public function store(StoreBankDepositRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function() use ($request) {
            $items = collect($request->items)->filter(fn($i) => (float)str_replace(',', '', $i['amount']) > 0)->values()->all();

            $total = collect($items)->sum(fn($i) => (float)str_replace(',', '', $i['amount']));

            $deposit = BankDeposit::create([
                'company_id' => session('active_company_id'),
                'deposit_no' => $request->depositNo,
                'deposit_date' => $request->depositDate,
                'deposit_to_account_id' => $request->depositTo,
                'cash_back_account_id' => $request->cashBackAccount,
                'cash_back_memo' => $request->cashBackMemo,
                'cash_back_amount' => (float) str_replace(',', '', $request->cashBackAmount ?? 0),
                'total_amount' => $total,
                'memo' => $request->memo,
                'status' => 'posted',
            ]);

            foreach ($items as $it) {
                BankDepositItem::create([
                    'bank_deposit_id' => $deposit->id,
                    'received_from' => $it['receivedFrom'] ?? null,
                    'account_id' => $it['account'] ?? null,
                    'description' => $it['description'] ?? null,
                    'payment_method_id' => $it['paymentMethod'] ?? null,
                    'ref_no' => $it['refNo'] ?? null,
                    'amount' => (float) str_replace(',', '', $it['amount']),
                ]);
            }

            // Financial truth
            $journalEntry = JournalEntry::create([
                'date' => $request->depositDate,
                'reference' => $request->depositNo,
                'description' => $request->memo,
                'transaction_type' => 'bank_deposit',
                'total_amount' => $total,
                'status' => 'posted',
                'created_by' => Auth::id(),
                'transactionable_id' => $deposit->id,
                'transactionable_type' => BankDeposit::class,
            ]);

            // Debit deposit account (bank)
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'chart_of_acc_id' => $request->depositTo,
                'debit' => $total,
                'credit' => 0,
                'memo' => $request->memo,
            ]);

            // Credit each source account
            foreach ($items as $it) {
                if (!empty($it['account'])) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'chart_of_acc_id' => $it['account'],
                        'debit' => 0,
                        'credit' => (float) str_replace(',', '', $it['amount']),
                        'memo' => $it['description'] ?? $request->memo,
                    ]);
                }
            }
        });

        $action = $request->input('action', 'save');
        if ($action === 'close') {
            return redirect()->route('dashboard')->with('success', 'Bank deposit saved successfully.');
        }

        if ($action === 'new') {
            return redirect()->route('deposit')->with('success', 'Bank deposit saved successfully.');
        }

        return redirect()->back()->with('success', 'Bank deposit saved successfully.');
    }

    private function getNextDepositNo()
    {
        $last = BankDeposit::where('company_id', session('active_company_id'))->latest()->first();
        return $last ? (int)filter_var($last->deposit_no, FILTER_SANITIZE_NUMBER_INT) + 1 : 1001;
    }
}
