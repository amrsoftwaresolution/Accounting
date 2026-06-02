<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJournalEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:chart_of_accs,id',
        ];
    }
}
