<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WarrantyClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'claim_date' => 'required|date',
            'odometer_at_claim' => 'nullable|integer|min:0',
            'issue_description' => 'required|string',
            'resolution' => 'nullable|string',
            'resolved_invoice_id' => 'nullable|exists:sales_invoices,id',
        ];
    }
}
