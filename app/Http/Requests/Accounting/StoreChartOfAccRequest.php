<?php

namespace App\Http\Requests\Accounting;

use App\Models\ChartOfAcc;
use App\Models\Company;
use App\Models\Currency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreChartOfAccRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('chart_of_accs', 'account_code')->where(function ($query) {
                    return $query->where('company_id', session('active_company_id'));
                })
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $companyId = session('active_company_id');
                    $exists = ChartOfAcc::query()->where('company_id', '=', $companyId)
                        ->whereRaw('LOWER(name) = ?', [Str::lower($value)])
                        ->exists();

                    if ($exists) {
                        $fail('An account with this name already exists.');
                    }
                },
            ],
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'sub_type' => 'nullable|string|max:255',
            'opening_balance' => 'nullable|numeric',
            'opening_balance_date' => 'nullable|date',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'currency' => [
                'nullable',
                'string',
                'max:10',
                function ($attribute, $value, $fail) {
                    $company = Company::find(session('active_company_id'));
                    $validCurrencies = Currency::query()->pluck('code')->map(fn ($code) => strtoupper((string) $code))->all();

                    if (!blank($value) && !in_array(strtoupper((string) $value), $validCurrencies, true)) {
                        $fail('Please select a valid currency.');
                    }

                    if ($company?->multicurrency && blank($value)) {
                        $fail('Currency is required when multi-currency is enabled.');
                    }
                },
            ],
            'parent_id' => 'nullable|uuid|exists:chart_of_accs,id',
            'is_locked' => 'nullable|boolean',
        ];
    }
}
