<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class StoreChequeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payee' => 'nullable',
            'account' => 'required', // This corresponds to Bank Account
            'date' => 'required|date',
            'cheque_no' => 'nullable|string',
            'mailing_address' => 'nullable|string',
            'memo' => 'nullable|string',
            'currency_id' => 'nullable|exists:currencies,id',
            'exchange_rate' => 'nullable|numeric|gt:0',
            'items' => 'nullable|array',
            'paymentAccount' => 'required_without:account',
            'paymentDate' => 'required_without:date|date',
        ];
    }
}
