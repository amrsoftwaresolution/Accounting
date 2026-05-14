<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Employee;

class LookupController extends Controller
{
    /**
     * Unified endpoint to fetch payees (Suppliers, Customers, Employees)
     */
    public function payees(Request $request)
    {
        $search = $request->query('search');
        $requestedType = $request->query('type');

        $query = null;

        if (!$requestedType || $requestedType === 'Supplier') {
            $suppliers = Supplier::select('id', 'display_name as label')
                ->selectRaw("'Supplier' as type")
                ->when($search, fn($q) => $q->where('display_name', 'like', "%{$search}%"));
            $query = $suppliers;
        }

        if (!$requestedType || $requestedType === 'Customer') {
            $customers = Customer::select('id', 'display_name as label')
                ->selectRaw("'Customer' as type")
                ->when($search, fn($q) => $q->where('display_name', 'like', "%{$search}%"));
            $query = $query ? $query->union($customers) : $customers;
        }

        if (!$requestedType || $requestedType === 'Employee') {
            $employees = Employee::select('id', 'name as label')
                ->selectRaw("'Employee' as type")
                ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"));
            $query = $query ? $query->union($employees) : $employees;
        }

        $payees = $query->orderBy('label')
            ->get()
            ->map(function($p) {
                return [
                    'value' => $p->id,
                    'label' => $p->label,
                    'type' => $p->type
                ];
            });

        return response()->json($payees);
    }

    /**
     * Endpoint to fetch accounts from Chart of Accounts
     */
    public function accounts(Request $request)
    {
        $search = $request->query('search');
        $type = $request->query('type'); // optional: filter by account_type

        $accounts = \App\Models\ChartOfAcc::select('id', 'name', 'account_code', 'balance')
            ->when($search, function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('account_code', 'like', "%{$search}%");
            })
            ->when($type, fn($q) => $q->where('account_type', $type))
            ->orderBy('account_code')
            ->get()
            ->map(function($acc) {
                return [
                    'value' => $acc->id,
                    'label' => "{$acc->account_code} - {$acc->name}",
                    'balance' => $acc->balance
                ];
            });

        return response()->json($accounts);
    }

    /**
     * Endpoint to fetch items (Products/Services)
     */
    public function items(Request $request)
    {
        $search = $request->query('search');

        $items = \App\Models\Item::select('id', 'name', 'sale_price')
            ->when($search, function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->get()
            ->map(function($item) {
                return [
                    'value' => $item->id,
                    'label' => $item->name,
                    'rate' => $item->sale_price
                ];
            });

        return response()->json($items);
    }

    /**
     * Endpoint to fetch item categories
     */
    public function categories(Request $request)
    {
        $categories = \App\Models\ItemCategory::select('id', 'name')
            ->orderBy('name')
            ->get();
            
        return response()->json($categories);
    }
}
