<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    public function salesByItem(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date') ?: now()->toDateString();

        $query = DB::table('sales_invoice_items')
            ->join('sales_invoices', 'sales_invoice_items.sales_invoice_id', '=', 'sales_invoices.id')
            ->join('customers', 'sales_invoices.customer_id', '=', 'customers.id')
            ->join('items', 'sales_invoice_items.item_id', '=', 'items.id')
            ->where('sales_invoices.status', 'posted');

        if ($startDate) {
            $query->whereBetween('sales_invoices.receipt_date', [$startDate, $endDate]);
        } else {
            $query->where('sales_invoices.receipt_date', '<=', $endDate);
        }

        $allLines = $query->select(
                'sales_invoice_items.id as line_id',
                'sales_invoice_items.item_id',
                'items.name as item_name',
                'items.sku as item_sku',
                'sales_invoice_items.quantity',
                'sales_invoice_items.rate',
                'sales_invoice_items.amount',
                'sales_invoices.receipt_no as reference',
                'sales_invoices.receipt_date as date',
                'sales_invoices.id as sales_invoice_id',
                'customers.display_name as customer_name'
            )
            ->orderBy('sales_invoices.receipt_date', 'asc')
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
                        'journal_entry_id' => $line->sales_invoice_id,
                        'date' => $line->date,
                        'transaction_type' => 'sales_invoice',
                        'reference' => $line->reference,
                        'contact_name' => $line->customer_name,
                        'qty' => (float) $line->quantity,
                        'rate' => (float) $line->rate,
                        'amount' => (float) $line->amount,
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('Reports/SalesByItem', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom',
            ],
        ]);
    }

    public function salesByCustomer(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date') ?: now()->toDateString();

        $query = DB::table('sales_invoices')
            ->join('customers', 'sales_invoices.customer_id', '=', 'customers.id')
            ->where('sales_invoices.status', 'posted');

        if ($startDate) {
            $query->whereBetween('sales_invoices.receipt_date', [$startDate, $endDate]);
        } else {
            $query->where('sales_invoices.receipt_date', '<=', $endDate);
        }

        $reportData = $query->select(
                'sales_invoices.customer_id',
                'customers.display_name as customer_name',
                DB::raw('COUNT(sales_invoices.id) as invoice_count'),
                DB::raw('SUM(sales_invoices.total_amount) as total_amount')
            )
            ->groupBy('sales_invoices.customer_id', 'customers.display_name')
            ->orderByDesc('total_amount')
            ->get();

        return Inertia::render('Reports/SalesByCustomer', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom',
            ],
        ]);
    }
}
