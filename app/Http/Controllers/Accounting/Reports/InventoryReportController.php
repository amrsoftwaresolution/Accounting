<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InventoryReportController extends Controller
{
    public function inventorySummary(Request $request)
    {
        $items = DB::table('items')->select('id', 'name', 'sku')->get();
        return Inertia::render('Reports/InventorySummary', ['items' => $items]);
    }

    public function inventoryDetailAll(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date') ?: date('Y-m-d');

        $items = \App\Models\Item::query()
            ->where('track_inventory', true)
            ->orderBy('name')
            ->get();

        $query = DB::table('journal_entries')
            ->join('journal_entry_lines', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('chart_of_accs.sub_type', 'inventory');

        if ($startDate) {
            $query->whereBetween('journal_entries.date', [$startDate, $endDate]);
        } else {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        $allLines = $query->select('journal_entry_lines.*', 'journal_entries.date', 'journal_entries.reference', 'journal_entries.transaction_type')
            ->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->get();

        $reportData = $items->map(function ($item) use ($allLines) {
            $itemLines = $allLines->filter(function ($line) use ($item) {
                return stripos($line->memo, $item->name) !== false;
            })->values()->map(function ($line) use ($item) {
                $qtyChange = 0;
                if ($item->purchase_price > 0) {
                    if ($line->debit > 0) {
                        $qtyChange = $line->debit / $item->purchase_price;
                    } else if ($line->credit > 0) {
                        $qtyChange = -($line->credit / $item->purchase_price);
                    }
                }

                return [
                    'id' => $line->id,
                    'date' => $line->date,
                    'transaction_type' => $line->transaction_type,
                    'reference' => $line->reference,
                    'memo' => $line->memo,
                    'qty_change' => round($qtyChange, 2),
                    'debit' => (float)$line->debit,
                    'credit' => (float)$line->credit,
                    'rate' => (float)$item->purchase_price,
                ];
            });

            return [
                'item' => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'purchase_price' => (float)$item->purchase_price,
                    'qty_on_hand' => (float)$item->quantity_on_hand,
                    'asset_value' => (float)($item->quantity_on_hand * $item->purchase_price),
                ],
                'lines' => $itemLines,
            ];
        })->filter(function ($group) {
            return $group['lines']->isNotEmpty() || $group['item']['qty_on_hand'] > 0;
        })->values();

        return Inertia::render('Reports/AllInventoryDetail', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom'
            ]
        ]);
    }

    public function inventoryDetail(Request $request, \App\Models\Item $item)
    {
        if (!$item->track_inventory) {
            abort(404);
        }

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date') ?: date('Y-m-d');

        $query = DB::table('journal_entries')
            ->join('journal_entry_lines', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('chart_of_accs', 'journal_entry_lines.chart_of_acc_id', '=', 'chart_of_accs.id')
            ->where('chart_of_accs.sub_type', 'inventory')
            ->where('journal_entry_lines.memo', 'like', '%' . $item->name . '%');

        if ($startDate) {
            $query->whereBetween('journal_entries.date', [$startDate, $endDate]);
        } else {
            $query->where('journal_entries.date', '<=', $endDate);
        }

        $lines = $query->select('journal_entry_lines.*', 'journal_entries.date', 'journal_entries.reference', 'journal_entries.transaction_type')
            ->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->get()
            ->map(function ($line) use ($item) {
                $qtyChange = 0;
                if ($item->purchase_price > 0) {
                    if ($line->debit > 0) {
                        $qtyChange = $line->debit / $item->purchase_price;
                    } else if ($line->credit > 0) {
                        $qtyChange = -($line->credit / $item->purchase_price);
                    }
                }

                return [
                    'id' => $line->id,
                    'date' => $line->date,
                    'transaction_type' => $line->transaction_type,
                    'reference' => $line->reference,
                    'memo' => $line->memo,
                    'qty_change' => round($qtyChange, 2),
                ];
            });

        return Inertia::render('Reports/InventoryDetail', [
            'item' => [
                'id' => $item->id,
                'name' => $item->name,
                'sku' => $item->sku,
            ],
            'lines' => $lines,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate,
                'type' => $request->query('type') ?? 'custom'
            ]
        ]);
    }
}
