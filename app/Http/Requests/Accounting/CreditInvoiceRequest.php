<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class CreditInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('items') && is_array($this->items)) {
            $filteredItems = array_filter($this->items, function ($item) {
                return !empty($item['product']) || !empty($item['description']) || (!empty($item['qty']) && $item['qty'] !== '0' && $item['qty'] !== '1') || (!empty($item['amount']) && $item['amount'] !== '0.00' && $item['amount'] !== '0');
            });
            
            $this->merge([
                'items' => array_values($filteredItems),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'customer' => 'required',
            'invoiceNo' => 'required',
            'invoiceDate' => 'required|date',
            'dueDate' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product' => 'required',
            'items.*.rate' => 'required',
            'items.*.amount' => 'required',
            'discount_type' => 'nullable|in:percent,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'prefix' => 'nullable|string',
            'memo_on_statement' => 'nullable|string',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        \Log::error('Validation Failed in CreditInvoiceRequest', [
            'errors' => $validator->errors()->toArray(),
            'request' => $this->all()
        ]);
        parent::failedValidation($validator);
    }
}
