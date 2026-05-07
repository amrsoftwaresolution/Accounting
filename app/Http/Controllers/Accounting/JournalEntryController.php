<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Employee;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class JournalEntryController extends Controller
{
    public function index()
    {
        $entries = JournalEntry::with(['creator', 'lines.account'])
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Transaction/JournalEntryList', [
            'entries' => $entries
        ]);
    }

    public function create()
    {
        $accounts = ChartOfAcc::orderBy('account_code')->get();

        // Get the last numeric reference and increment it
        $lastRef = JournalEntry::where('transaction_type', 'journal_entry')
            ->whereNotNull('reference')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->first();

        $nextJournalNo = ($lastRef && is_numeric($lastRef->reference)) ? (int)$lastRef->reference + 1 : 1;

        return Inertia::render('Transaction/JournalEntryForm', [
            'accounts' => $accounts,
            'nextJournalNo' => (string)$nextJournalNo
        ]);
    }

    public function store(Request $request)
{
    $request->validate([
        'date' => 'required|date',
        'lines' => 'required|array|min:2',
        'lines.*.account_id' => 'required|exists:chart_of_accs,id',
        'lines.*.debit' => 'nullable|numeric',
        'lines.*.credit' => 'nullable|numeric',
    ]);

    return DB::transaction(function () use ($request) {
        $totalDebit = 0;
        $totalCredit = 0;

        $entry = JournalEntry::create([
            'company_id' => session('active_company_id'), // FIX 1: Ensure company_id is set
            'date' => $request->date,
            'reference' => $request->reference_no,
            'description' => $request->description,
            'transaction_type' => 'journal_entry',
            'status' => 'posted',
            'created_by' => Auth::id(),
        ]);

        foreach ($request->lines as $line) {
            $debit = (float)($line['debit'] ?? 0);
            $credit = (float)($line['credit'] ?? 0);

            if ($debit == 0 && $credit == 0) continue;

            $payeeId = $line['payee_id'] ?? null;
            $payeeType = null;

            // FIX 2: Check if payeeId is a valid UUID/ID before searching
            if ($payeeId) {
                if (Supplier::where('id', $payeeId)->exists()) $payeeType = Supplier::class;
                elseif (Customer::where('id', $payeeId)->exists()) $payeeType = Customer::class;
                elseif (Employee::where('id', $payeeId)->exists()) $payeeType = Employee::class;
            }

            $entry->lines()->create([
                'chart_of_acc_id' => $line['account_id'],
                'payee_id' => $payeeId,
                'payee_type' => $payeeType,
                'debit' => $debit,
                'credit' => $credit,
                'memo' => $line['description'] ?? null,
            ]);

            $totalDebit += $debit;
            $totalCredit += $credit;
        }

        // Use a small epsilon check for floating point math safety
        if (abs($totalDebit - $totalCredit) > 0.001) {
            throw new \Exception("Debits ({$totalDebit}) and Credits ({$totalCredit}) must balance.");
        }

        $entry->update(['total_amount' => $totalDebit]);

        return response()->json([
            'message' => 'Journal Entry Created',
            'id' => $entry->id
        ]);
    });
}

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $accounts = ChartOfAcc::orderBy('account_code')->get();

        return Inertia::render('Transaction/JournalEntryForm', [
            'journalEntry' => $journalEntry,
            'accounts' => $accounts
        ]);
    }

    public function update(Request $request, JournalEntry $journalEntry)
    {
        $request->validate([
            'date' => 'required|date',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:chart_of_accs,id',
        ]);

        return DB::transaction(function () use ($request, $journalEntry) {
            $journalEntry->update([
                'date' => $request->date,
                'reference' => $request->reference_no,
                'description' => $request->description,
            ]);

            $journalEntry->lines()->delete();

            $totalDebit = 0;
            foreach ($request->lines as $line) {
                $debit = (float)($line['debit'] ?? 0);
                $credit = (float)($line['credit'] ?? 0);

                if ($debit == 0 && $credit == 0) continue;

                $payeeId = $line['payee_id'] ?? null;
                $payeeType = null;
                if ($payeeId) {
                    if (Supplier::find($payeeId)) $payeeType = Supplier::class;
                    elseif (Customer::find($payeeId)) $payeeType = Customer::class;
                    elseif (Employee::find($payeeId)) $payeeType = Employee::class;
                }

                $journalEntry->lines()->create([
                    'chart_of_acc_id' => $line['account_id'],
                    'payee_id' => $payeeId,
                    'payee_type' => $payeeType,
                    'debit' => $debit,
                    'credit' => $credit,
                    'memo' => $line['description'] ?? null,
                ]);

                $totalDebit += $debit;
            }

            $journalEntry->update(['total_amount' => $totalDebit]);

            return response()->json(['message' => 'Journal Entry Updated']);
        });
    }
}
