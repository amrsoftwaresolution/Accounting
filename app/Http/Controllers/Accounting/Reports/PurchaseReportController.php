<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PurchaseReportController extends Controller
{
    public function purchaseByItem(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date') ?: now()->toDateString();

        $query = DB::table('bill_items')
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->join('suppliers', 'bills.supplier_id', '=', 'suppliers.id')
            ->join('items', 'bill_items.item_id', '=', 'items.id')
            ->where('bills.status', 'posted');

        if ($startDate) {
            $query->whereBetween('bills.bill_date', [$startDate, $endDate]);
        } else {
            $query->where('bills.bill_date', '<=', $endDate);
        }

        $allLines = $query->select(
                'bill_items.id as line_id',
                'bill_items.item_id',
                'items.name as item_name',
                'items.sku as item_sku',
                'bill_items.quantity',
                'bill_items.rate',
                'bill_items.amount',
                'bills.bill_no as reference',
                'bills.bill_date as date',
                'bills.id as bill_id',
                'suppliers.display_name as supplier_name'
            )
            ->orderBy('bills.bill_date', 'asc')
            ->get();

        $reportData = $allLines->groupBy('item_id')->map(function ($lines, $itemId) {
            $firstLine = $lines->first();
            return [
                'item' => [
                    'id' => $itemId,
                    'name' => $firstLine->item_name,
                    'sku' => $firstLine->item_sku,
                    'total_qty' => $lines->sum('quantity'),
                    'total_amount' => $lines->sum('amount'),
                ],
                'lines' => $lines->map(function ($line) {
                    return [
                        'id' => $line->line_id,
                        'journal_entry_id' => $line->bill_id,
                        'date' => $line->date,
                        'transaction_type' => 'bill',
                        'reference' => $line->reference,
                        'contact_name' => $line->supplier_name,
                        'qty' => (float) $line->quantity,
                        'rate' => (float) $line->rate,
                        'amount' => (float) $line->amount,
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('Reports/PurchaseByItem', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom',
            ],
        ]);
    }

    public function purchaseBySupplier(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date') ?: now()->toDateString();

        $query = DB::table('bills')
            ->join('suppliers', 'bills.supplier_id', '=', 'suppliers.id')
            ->where('bills.status', 'posted');

        if ($startDate) {
            $query->whereBetween('bills.bill_date', [$startDate, $endDate]);
        } else {
            $query->where('bills.bill_date', '<=', $endDate);
        }

        $reportData = $query->select(
                'bills.supplier_id',
                'suppliers.display_name as supplier_name',
                DB::raw('COUNT(bills.id) as tx_count'),
                DB::raw('SUM(bills.total_amount) as total_amount')
            )
            ->groupBy('bills.supplier_id', 'suppliers.display_name')
            ->orderByDesc('total_amount')
            ->get();

        return Inertia::render('Reports/PurchaseBySupplier', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom',
            ],
        ]);
    }
}
