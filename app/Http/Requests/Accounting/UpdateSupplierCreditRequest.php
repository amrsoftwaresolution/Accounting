<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierCreditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier' => 'required',
            'creditDate' => 'required|date',
            'creditNo' => 'required',
            'items' => 'nullable|array',
            'itemDetails' => 'nullable|array',
        ];
    }
}
