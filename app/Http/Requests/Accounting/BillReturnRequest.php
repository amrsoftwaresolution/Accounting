<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class BillReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier' => 'required',
            'date' => 'required|date',
            'reference' => 'required',
            'items' => 'nullable|array',
            'itemDetails' => 'nullable|array',
        ];
    }
}
