<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Employee;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/ExpenseForm', [
            'suppliers' => Supplier::orderBy('display_name')->get(),
            'customers' => Customer::orderBy('display_name')->get(),
            'employees' => Employee::join('users', 'employees.user_id', '=', 'users.id')
                ->select('employees.*', 'users.name as user_name')
                ->orderBy('users.name')
                ->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get()
        ]);
    }
}
