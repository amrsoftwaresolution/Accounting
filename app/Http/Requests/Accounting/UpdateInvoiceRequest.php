<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
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
            'items' => 'required|array|min:1',
        ];
    }
}
