<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class ChequeRequest extends FormRequest
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
            'items' => 'nullable|array',
            'paymentAccount' => 'required_without:account',
            'paymentDate' => 'required_without:date|date',
        ];
    }
}
