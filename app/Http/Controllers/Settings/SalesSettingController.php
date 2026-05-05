<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SalesSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesSettingController extends Controller
{
    public function index(Request $request)
    {
        // Always ensure we have at least one record for the current company
        $companyId = session('active_company_id');
        $settings = SalesSetting::firstOrCreate(['company_id' => $companyId]);

        return Inertia::render('Settings/SalesSettings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'preferred_invoice_terms' => 'nullable|string|max:50',
            'preferred_delivery_method' => 'nullable|string|max:50',
            'online_delivery_email_format' => 'nullable|string|max:50',
            'online_delivery_additional_option' => 'nullable|string|max:50',
            'statements_line_detail' => 'nullable|string|max:50',
        ]);

        $booleanFields = [
            'shipping_enabled',
            'custom_transaction_numbers_enabled',
            'service_date_enabled',
            'discount_enabled',
            'deposit_enabled',
            'tags_enabled',
            'show_product_service_column',
            'show_sku_column',
            'track_quantity_price_rate',
            'progress_invoicing_enabled',
            'reminders_enabled',
            'online_delivery_enabled',
            'online_delivery_pdf_attached',
            'statements_show_ageing_table',
        ];

        foreach ($booleanFields as $field) {
            $validated[$field] = $request->boolean($field);
        }

        $companyId = session('active_company_id');
        $settings = SalesSetting::firstOrCreate(['company_id' => $companyId]);
        $settings->update($validated);

        return back()->with('message', 'Sales settings updated successfully.');
    }
}
