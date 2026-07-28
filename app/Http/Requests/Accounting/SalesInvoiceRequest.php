<?php

namespace App\Http\Requests\Accounting;

use Illuminate\Foundation\Http\FormRequest;

class SalesInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer' => 'nullable',
            'email' => 'nullable|email',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'receiptDate' => 'required|date',
            'receiptNo' => 'required',
            'paymentMethod' => 'nullable',
            'depositTo' => 'required_unless:action,credit_sale',
            'items' => 'required|array|min:1',
            'items.*.product' => 'required',
            'items.*.amount' => 'required',
            'items.*.warranty' => 'nullable|array',
            'items.*.warranty.policy_id' => 'nullable|exists:warranty_policies,id',
            'items.*.warranty.start_date' => 'nullable|date',
            'action' => 'nullable|string',
            'repairingCost' => 'nullable|numeric',
        ];
    }
}
