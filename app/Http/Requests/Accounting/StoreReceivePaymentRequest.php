<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceivePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer' => 'required',
            'amountReceived' => 'required',
            'paymentDate' => 'required|date',
            'depositTo' => 'required',
        ];
    }
}
