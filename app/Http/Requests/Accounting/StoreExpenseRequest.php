<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payee' => 'nullable',
            'account' => 'required',
            'date' => 'required|date',
            'method' => 'nullable',
            'ref' => 'nullable|string',
            'memo' => 'nullable|string',
            'items' => 'nullable|array',
            'itemDetails' => 'nullable|array',
            'paymentAccount' => 'required_without:account',
            'paymentDate' => 'required_without:date|date',
            'paymentMethod' => 'nullable',
            'exchange_rate' => 'nullable|numeric|gt:0',
            'currency_id' => 'nullable|exists:currencies,id',
        ];
    }
}
