<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'depositDate' => 'required|date',
            'depositNo' => 'required',
            'depositTo' => 'required',
            'cashBackAccount' => 'nullable|uuid',
            'cashBackMemo' => 'nullable|string',
            'cashBackAmount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.amount' => 'required',
        ];
    }
}
