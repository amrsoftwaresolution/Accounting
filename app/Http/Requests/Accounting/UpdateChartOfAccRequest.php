<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChartOfAccRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $chartOfAccount = $this->route('chart_of_account');
        $chartOfAccountId = $chartOfAccount ? $chartOfAccount->id : null;

        return [
            'account_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('chart_of_accs', 'account_code')
                    ->ignore($chartOfAccountId)
                    ->where(function ($query) {
                        return $query->where('company_id', session('active_company_id'));
                    })
            ],
            'name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'sub_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'currency' => 'nullable|string|max:3',
            'parent_id' => [
                'nullable',
                'uuid',
                'exists:chart_of_accs,id',
                function ($attribute, $value, $fail) use ($chartOfAccountId) {
                    if ($value === $chartOfAccountId) {
                        $fail('An account cannot be its own parent account.');
                    }
                }
            ],
            'is_locked' => 'nullable|boolean',
        ];
    }
}
