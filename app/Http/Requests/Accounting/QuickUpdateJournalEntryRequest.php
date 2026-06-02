<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class QuickUpdateJournalEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'chart_of_acc_id' => 'required|exists:chart_of_accs,id',
            'offset_account_id' => 'nullable|exists:chart_of_accs,id',
            'debit' => 'required|numeric|min:0',
            'credit' => 'required|numeric|min:0',
            'payee_id' => 'nullable',
        ];
    }
}
