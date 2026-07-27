<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class CreditInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer' => 'required',
            'invoiceNo' => 'required',
            'invoiceDate' => 'required|date',
            'dueDate' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product' => 'required',
            'items.*.amount' => 'required',
        ];
    }
}
