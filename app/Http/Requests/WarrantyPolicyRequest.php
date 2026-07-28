<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WarrantyPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'applies_to' => 'required|in:service,product',
            'duration_days' => 'nullable|integer|min:0',
            'duration_km' => 'nullable|integer|min:0',
            'expiry_rule' => 'required|in:whichever_first,days_only,km_only',
            'terms_text' => 'nullable|string',
            'is_active' => 'boolean',
            'applicable_item_ids' => 'nullable|array',
            'applicable_item_ids.*' => 'uuid|exists:items,id',
        ];
    }
}
