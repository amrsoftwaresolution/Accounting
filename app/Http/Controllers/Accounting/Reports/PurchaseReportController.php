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
        $rows = DB::table('purchase_items')
            ->select('item_id', DB::raw('sum(quantity) as qty'), DB::raw('sum(total) as total'))
            ->groupBy('item_id')
            ->get();

        return Inertia::render('Reports/PurchaseByItem', ['rows' => $rows]);
    }

    public function purchaseBySupplier(Request $request)
    {
        $rows = DB::table('purchases')
            ->select('supplier_id', DB::raw('sum(total) as total'))
            ->groupBy('supplier_id')
            ->get();

        return Inertia::render('Reports/PurchaseBySupplier', ['rows' => $rows]);
    }
}
