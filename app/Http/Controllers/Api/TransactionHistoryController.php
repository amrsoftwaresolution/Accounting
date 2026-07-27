<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionHistoryController extends Controller
{
    public function index(Request $request, string $transactionType)
    {
        $limit = max(1, (int) $request->query('limit', 5));

        return response()->json($this->buildRecords($transactionType, $limit));
    }

    public function page(string $transactionType)
    {
        return Inertia::render('Transaction/TransactionHistoryPage', [
            'transactionType' => $this->normalizeType($transactionType),
            'records' => $this->buildRecords($transactionType, 100),
        ]);
    }

    private function buildRecords(string $transactionType, int $limit = 5): array
    {
        $normalizedType = $this->normalizeType($transactionType);

        return JournalEntry::query()
            
            ->where('transaction_type', $normalizedType)
            ->with(['payee', 'transactionable'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function (JournalEntry $entry) use ($normalizedType) {
                $memo = $entry->description
                    ?: $entry->transactionable?->memo
                    ?: $entry->transactionable?->description
                    ?: '—';

                if (mb_strlen($memo) > 100) {
                    $memo = mb_substr($memo, 0, 97) . '...';
                }

                $amount = $entry->total_amount
                    ?: $entry->transactionable?->total_amount
                    ?: $entry->transactionable?->amount
                    ?: 0;
                    
                $refNo = $entry->reference 
                    ?: $entry->transactionable?->reference_number
                    ?: $entry->transactionable?->invoice_number
                    ?: $entry->transactionable?->bill_number
                    ?: $entry->transactionable?->receipt_number
                    ?: '—';
                    
                $payeeName = $entry->payee?->display_name
                    ?: $entry->transactionable?->customer?->display_name
                    ?: $entry->transactionable?->supplier?->display_name
                    ?: '—';

                return [
                    'id' => $entry->id,
                    'date' => $entry->date
                        ?: $entry->transactionable?->invoice_date
                        ?: $entry->transactionable?->bill_date
                        ?: $entry->transactionable?->receipt_date
                        ?: $entry->transactionable?->payment_date
                        ?: $entry->created_at?->toDateString(),
                    'ref_no' => $refNo,
                    'payee_account' => $payeeName,
                    'memo' => $memo,
                    'debit' => in_array($normalizedType, ['invoice', 'receive_payment', 'bank_deposit', 'payment', 'supplier_credit', 'journal_entry', 'inventory_adjustment']) ? $amount : 0,
                    'credit' => in_array($normalizedType, ['bill', 'credit_note', 'sales_receipt']) ? $amount : 0,
                    'amount' => $amount,
                ];
            })
            ->values()
            ->toArray();
    }

    private function normalizeType(string $type): string
    {
        $map = [
            'creditsale' => 'invoice',
            'credit sale' => 'invoice',
            'recivepayment' => 'receive_payment',
            'received payment' => 'receive_payment',
            'cash sale' => 'sales_receipt',
            'sales return' => 'credit_note',
            'receive_payment' => 'receive_payment',
            'bill' => 'bill',
            'supplier return' => 'supplier_credit',
            'suppliercredit' => 'supplier_credit',
            'bank deposit' => 'bank_deposit',
            'deposit' => 'bank_deposit',
            'transfer' => 'transfer',
            'journal entry' => 'journal_entry',
            'journel entry' => 'journal_entry',
            'inventory qty adj' => 'inventory_adjustment',
            'inventory adjustment' => 'inventory_adjustment',
        ];

        $normalized = strtolower(trim(str_replace(['_', ' ', '-'], ' ', $type)));

        return $map[$normalized] ?? $normalized;
    }
}
