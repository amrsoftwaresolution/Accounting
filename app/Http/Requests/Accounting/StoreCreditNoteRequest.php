<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class StoreCreditNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer' => 'required',
            'creditNoteDate' => 'required|date',
            'creditNoteNo' => 'required',
            'items' => 'required|array|min:1',
        ];
    }
}
