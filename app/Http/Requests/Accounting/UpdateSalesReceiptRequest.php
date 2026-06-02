<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer' => 'required',
            'receiptDate' => 'required|date',
            'receiptNo' => 'required',
            'paymentMethod' => 'nullable',
            'depositTo' => 'required',
            'items' => 'required|array|min:1',
            'items.*.product' => 'required',
            'items.*.amount' => 'required',
            'action' => 'nullable|string',
        ];
    }
}
