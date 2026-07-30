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
        $details = DB::table('inventory_movements')->get();
        return Inertia::render('Reports/InventoryDetailAll', ['details' => $details]);
    }

    public function inventoryDetail($itemId)
    {
        $details = DB::table('inventory_movements')->where('item_id', $itemId)->get();
        return Inertia::render('Reports/InventoryDetail', ['details' => $details]);
    }
}
