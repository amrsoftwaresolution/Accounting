<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;
use App\Models\Customer;
use Inertia\Inertia;

class ReceivePaymentController extends Controller
{
    public function create()
    {
        return Inertia::render('Transaction/ReceivePaymentForm', [
            'customers' => Customer::orderBy('display_name')->get(),
            'accounts' => ChartOfAcc::orderBy('account_code')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get()
        ]);
    }
}
