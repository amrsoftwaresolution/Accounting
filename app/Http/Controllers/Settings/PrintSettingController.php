<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PrintSetting;

class PrintSettingController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'document_type' => 'required|string',
            'page_setup' => 'nullable|array',
            'static_footer_content' => 'nullable|string',
        ]);

        $company = app(CompanySettingsController::class)->getActiveCompany();

        $printSetting = PrintSetting::updateOrCreate(
            [
                'company_id' => $company ? $company->id : null,
                'document_type' => $validated['document_type'],
            ],
            [
                'page_setup' => $validated['page_setup'] ?? [],
                'static_footer_content' => $validated['static_footer_content'] ?? null,
            ]
        );

        return redirect()->back()->with('success', 'Print settings updated successfully.');
    }
}
