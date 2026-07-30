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
        $rows = DB::table('sales_items')
            ->select('item_id', DB::raw('sum(quantity) as qty'), DB::raw('sum(total) as total'))
            ->groupBy('item_id')
            ->get();

        return Inertia::render('Reports/SalesByItem', ['rows' => $rows]);
    }

    public function salesByCustomer(Request $request)
    {
        $rows = DB::table('sales')
            ->select('customer_id', DB::raw('sum(total) as total'))
            ->groupBy('customer_id')
            ->get();

        return Inertia::render('Reports/SalesByCustomer', ['rows' => $rows]);
    }
}
