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
            $employees = Employee::join('users', 'employees.user_id', '=', 'users.id')
                ->select('employees.id', 'users.name as label')
                ->selectRaw("'Employee' as type")
                ->when($search, fn($q) => $q->where('users.name', 'like', "%{$search}%"));
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
}
