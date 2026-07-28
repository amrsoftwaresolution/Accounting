<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warranty;
use App\Models\SalesInvoice;
use Inertia\Inertia;

class WarrantyController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $warranties = Warranty::with(['warrantyPolicy', 'vehicle.customer', 'customer', 'invoiceItem.invoice'])
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($search, function ($query, $search) {
                return $query->whereHas('customer', function ($q) use ($search) {
                    $q->where('display_name', 'like', "%{$search}%");
                })->orWhereHas('vehicle', function ($q) use ($search) {
                    $q->where('vehicle_no', 'like', "%{$search}%");
                })->orWhereHas('invoiceItem.invoice', function ($q) use ($search) {
                    $q->where('receipt_no', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Warranties/Index', [
            'warranties' => $warranties,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function show(Warranty $warranty)
    {
        $warranty->load(['warrantyPolicy', 'vehicle.customer', 'customer', 'invoiceItem.invoice', 'claims.resolvedInvoice']);

        $resolvedInvoices = SalesInvoice::orderBy('receipt_no')->limit(50)->get();

        return Inertia::render('Warranties/Show', [
            'warranty' => $warranty,
            'resolvedInvoices' => $resolvedInvoices,
        ]);
    }
}
