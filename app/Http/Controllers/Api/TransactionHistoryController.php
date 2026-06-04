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
            ->where('company_id', session('active_company_id'))
            ->where('transaction_type', $normalizedType)
            ->with(['payee', 'transactionable'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function (JournalEntry $entry) {
                return [
                    'id' => $entry->id,
                    'number' => $entry->reference
                        ?: $entry->transactionable?->invoice_no
                        ?: $entry->transactionable?->bill_no
                        ?: $entry->transactionable?->receipt_no
                        ?: $entry->transactionable?->reference_no
                        ?: $entry->transactionable?->payment_no
                        ?: $entry->transactionable?->number
                        ?: $entry->id,
                    'date' => $entry->date
                        ?: $entry->transactionable?->invoice_date
                        ?: $entry->transactionable?->bill_date
                        ?: $entry->transactionable?->receipt_date
                        ?: $entry->transactionable?->payment_date
                        ?: $entry->created_at?->toDateString(),
                    'name' => $entry->payee?->display_name
                        ?: $entry->payee?->name
                        ?: $entry->payee?->supplier_name
                        ?: $entry->payee?->customer_name
                        ?: '—',
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
            'recivepayment' => 'payment',
            'received payment' => 'payment',
            'cash sale' => 'sales_receipt',
            'sales return' => 'credit_note',
            'payment' => 'payment',
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
