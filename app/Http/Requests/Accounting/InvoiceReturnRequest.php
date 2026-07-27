<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer' => 'required',
            'date' => 'required|date',
            'reference' => 'required',
            'items' => 'required|array|min:1',
        ];
    }
}
