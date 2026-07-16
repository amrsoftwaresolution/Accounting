<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PrintSettingController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'document_type' => 'required|string',
            'custom_title' => 'nullable|string|max:255',
            'static_footer_content' => 'nullable|string',
            'layout_config' => 'nullable|array',
            'primary_color' => 'nullable|string',
            'text_color' => 'nullable|string',
            'page_setup' => 'nullable|array',
            'block_styles' => 'nullable|array',
        ]);

        $companyId = session('active_company_id');
        
        $setting = \App\Models\PrintSetting::updateOrCreate(
            ['company_id' => $companyId, 'document_type' => $validated['document_type']],
            [
                'custom_title' => $validated['custom_title'] ?? null,
                'static_footer_content' => $validated['static_footer_content'] ?? null,
                'layout_config' => $validated['layout_config'] ?? null,
                'primary_color' => $validated['primary_color'] ?? '#111827',
                'text_color' => $validated['text_color'] ?? '#374151',
                'page_setup' => $validated['page_setup'] ?? null,
                'block_styles' => $validated['block_styles'] ?? null,
            ]
        );

        return back()->with('message', 'Print settings updated successfully.');
    }

    public function preview(Request $request)
    {
        $company = \App\Models\Company::find(session('active_company_id')) ?? new \App\Models\Company(['company_name' => 'Demo Company', 'address' => "123 Main St\nCity, Country"]);
        
        $title = $request->input('custom_title') ?: 'Document Preview';
        $staticFooterContent = $request->input('static_footer_content');
        $layoutConfig = $request->input('layout_config');
        $primaryColor = $request->input('primary_color', '#111827');
        $textColor = $request->input('text_color', '#374151');
        $pageSetup = $request->input('page_setup', []);
        $blockStyles = $request->input('block_styles', []);

        $tableItems = [
            ["<div class='font-semibold text-gray-800'>Sample Item 1</div><div class='text-sm text-gray-500 mt-1'>Sample description</div>", 2, "$150.00", "$300.00"],
            ["<div class='font-semibold text-gray-800'>Sample Service</div>", 1, "$500.00", "$500.00"],
        ];

        return view('print.document', [
            'title' => $title,
            'staticFooterContent' => $staticFooterContent,
            'layoutConfig' => $layoutConfig,
            'primaryColor' => $primaryColor,
            'textColor' => $textColor,
            'pageSetup' => $pageSetup,
            'blockStyles' => $blockStyles,
            'documentNo' => 'INV-0001',
            'date' => now()->format('Y-m-d'),
            'dueDate' => now()->addDays(14)->format('Y-m-d'),
            'partyLabel' => 'Bill To',
            'partyName' => 'John Doe',
            'partyAddress' => "456 Customer Ave\nCustomer City, ST 12345",
            'partyEmail' => 'john.doe@example.com',
            'tableHeaders' => ['Description', 'Qty', 'Rate', 'Amount'],
            'tableItems' => $tableItems,
            'totalAmount' => 800.00,
            'balanceDue' => 800.00,
            'memo' => 'Thank you for your business.',
            'statementMessage' => '',
            'company' => $company,
            'isPreview' => true,
        ]);
    }
}
