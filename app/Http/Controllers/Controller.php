<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;

abstract class Controller
{
    public function paymentMethods()
    {
        return PaymentMethod::withoutGlobalScopes()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}
