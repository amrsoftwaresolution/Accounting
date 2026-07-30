<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\PaymentMethod;

class ReceivePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $chequeMethodId = PaymentMethod::withoutGlobalScopes()
            ->where('name', 'Cheque')
            ->value('id');

        return [
            'customer' => 'required',
            'amountReceived' => 'required',
            'paymentDate' => 'required|date',
            'depositTo' => 'required',
            'paymentMethod' => 'required',
            'checkDate' => [
                Rule::requiredIf($this->paymentMethod === $chequeMethodId),
                'nullable',
                'date',
            ],
            'checkNumber' => [
                Rule::requiredIf($this->paymentMethod === $chequeMethodId),
                'nullable',
                'string',
            ],
        ];
    }
}
