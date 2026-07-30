<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Reports\BalanceSheetResource;
use App\Http\Resources\Reports\CustomerBalanceResource;
use App\Http\Resources\Reports\InventorySummaryResource;
use App\Http\Resources\Reports\ProfitAndLossResource;
use App\Http\Resources\Reports\PurchaseByItemResource;
use App\Http\Resources\Reports\PurchaseBySupplierResource;
use App\Http\Resources\Reports\SalesByCustomerResource;
use App\Http\Resources\Reports\SalesByItemResource;
use App\Http\Resources\Reports\SupplierBalanceResource;
use App\Services\Reports\ReportDataService;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    protected $reportDataService;

    public function __construct(ReportDataService $reportDataService)
    {
        $this->reportDataService = $reportDataService;
    }

    public function profitAndLoss(Request $request)
    {
        $reportData = $this->reportDataService->profitAndLoss(
            $request->query('start_date'),
            $request->query('end_date'),
            $request->query('display_by', 'total')
        );

        return new ProfitAndLossResource($reportData);
    }

    public function balanceSheet(Request $request)
    {
        $reportData = $this->reportDataService->balanceSheet(
            $request->query('start_date'),
            $request->query('end_date'),
            $request->query('display_by', 'total')
        );

        return new BalanceSheetResource($reportData);
    }

    public function customerBalance(Request $request)
    {
        return CustomerBalanceResource::collection($this->reportDataService->customerBalance());
    }

    public function supplierBalance(Request $request)
    {
        return SupplierBalanceResource::collection($this->reportDataService->supplierBalance());
    }

    public function inventorySummary(Request $request)
    {
        return InventorySummaryResource::collection(
            $this->reportDataService->inventorySummary(
                $request->query('start_date'),
                $request->query('end_date')
            )
        );
    }

    public function salesByItem(Request $request)
    {
        return SalesByItemResource::collection($this->reportDataService->salesByItem());
    }

    public function salesByCustomer(Request $request)
    {
        return SalesByCustomerResource::collection($this->reportDataService->salesByCustomer());
    }

    public function purchaseByItem(Request $request)
    {
        return PurchaseByItemResource::collection($this->reportDataService->purchaseByItem());
    }

    public function purchaseBySupplier(Request $request)
    {
        return PurchaseBySupplierResource::collection($this->reportDataService->purchaseBySupplier());
    }
}
