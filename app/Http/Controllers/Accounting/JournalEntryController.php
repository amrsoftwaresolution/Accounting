<?php

namespace App\Http\Controllers\Accounting;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\JournalEntry;

class JournalEntryController extends Controller
{
    public function store(Request $request)
    {
        // ✅ Validation
        $request->validate([
            'date' => 'required|date',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
        ]);

        return DB::transaction(function () use ($request) {

            $totalDebit = 0;
            $totalCredit = 0;

            // ✅ Create main entry
            $entry = JournalEntry::create([
                'date' => $request->date,
                'reference_no' => $request->reference_no,
                'description' => $request->description,
                'created_by' => auth()->id(),
            ]);

            // ✅ Insert lines
            foreach ($request->lines as $line) {

                $debit = $line['debit'] ?? 0;
                $credit = $line['credit'] ?? 0;

                // ❌ Prevent both empty
                if ($debit == 0 && $credit == 0) {
                    throw new \Exception("Each line must have debit or credit");
                }

                $entry->lines()->create([
                    'account_id' => $line['account_id'],
                    'debit' => $debit,
                    'credit' => $credit,
                    'description' => $line['description'] ?? null,
                ]);

                $totalDebit += $debit;
                $totalCredit += $credit;
            }

            // ❌ Critical accounting rule
            if ($totalDebit != $totalCredit) {
                throw new \Exception("Debit and Credit must match");
            }

            // ✅ Update totals
            $entry->update([
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
            ]);

            return response()->json([
                'message' => 'Journal Entry Created',
                'data' => $entry->load('lines')
            ]);
        });
    }
}
