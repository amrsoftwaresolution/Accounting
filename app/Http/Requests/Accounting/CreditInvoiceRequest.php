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
            'items.*.amount' => 'required',
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
