<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class ChequeDepositRequest extends FormRequest
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
            'memo' => 'nullable|string',
            'selectedCheques' => 'required|array|min:1',
            'selectedCheques.*' => 'required|uuid',
        ];
    }

    public function messages(): array
    {
        return [
            'selectedCheques.required' => 'Please select at least one outstanding cheque.',
            'selectedCheques.min' => 'Please select at least one outstanding cheque.',
        ];
    }
}
