<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier' => 'required|exists:suppliers,id',
            'billDate' => 'required|date',
            'billNo' => 'required',
            'items' => 'nullable|array',
            'itemDetails' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier.exists' => 'The selected supplier does not exist. Please select a valid supplier.',
        ];
    }
}
