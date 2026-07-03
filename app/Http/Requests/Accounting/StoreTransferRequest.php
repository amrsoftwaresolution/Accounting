<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transfer_from' => 'required|uuid|exists:chart_of_accs,id',
            'transfer_to'   => 'required|uuid|exists:chart_of_accs,id|different:transfer_from',
            'amount'        => 'required|numeric|min:0.01',
            'date'          => 'required|date',
            'memo'          => 'nullable|string',
            'from_currency_id' => 'nullable|exists:currencies,id',
            'from_exchange_rate' => 'nullable|numeric|gt:0',
            'to_currency_id' => 'nullable|exists:currencies,id',
            'to_exchange_rate' => 'nullable|numeric|gt:0',
        ];
    }
}
