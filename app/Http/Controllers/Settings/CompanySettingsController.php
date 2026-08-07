<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanySettingsController extends Controller
{
    /**
     * Helper to get the active company.
     */
    private function getActiveCompany()
    {
        return \App\Models\Company::first();
    }

    private function getSettings()
    {
        return CompanySetting::firstOrCreate([]);
    }

    public function index()
    {
        $company = $this->getActiveCompany();

        $settings = $this->getSettings();

        // Merge company info and specific settings
        $salesSettings = class_exists(\App\Models\SalesSetting::class)
            ? (\App\Models\SalesSetting::query()->first()?->toArray() ?? [])
            : [];

        $advancedSettings = class_exists(\App\Models\AdvancedSettings::class)
            ? (\App\Models\AdvancedSettings::query()->first()?->toArray() ?? [])
            : [];

        $mergedData = array_merge($company ? $company->toArray() : [], $settings ? $settings->toArray() : [], [
            'settings_metadata' => [
                'payments' => [
                    'show_tags' => $settings->show_tags ?? false,
                    'bill_payment_terms' => $settings->bill_payment_terms ?? null,
                ],
                'sales' => $salesSettings,
                'advanced' => $advancedSettings,
                'print_settings' => \App\Models\PrintSetting::query()->get(),
            ],
        ]);

        return Inertia::render('Settings/Index', [
            'settings' => $mergedData,
            'tab' => request('tab', 'company'),
        ]);
    }

    /**
     * Update General Company Info
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'website' => 'nullable|string',
            'industry' => 'nullable|string',
            'home_currency_prefix' => 'nullable|string|max:10',
        ]);

        $company = $this->getActiveCompany();
        if ($company) {
            $company->update($validated);
        } else {
            \App\Models\Company::create($validated);
        }
        
        return back()->with('message', 'Company information updated successfully.');
    }

    /**
     * Update Legal & Tax Info
     */
public function updateLegal(Request $request)
{
    $validated = $request->validate([
        'legal_name' => 'nullable|string|max:255',
        'tax_id' => 'nullable|string|max:100',
        'business_type' => 'nullable|string',
        'legal_address' => 'nullable|string',
    ]);

    $company = $this->getActiveCompany();
    if ($company) {
        $company->update($validated);
    } else {
        \App\Models\Company::create($validated);
    }

    return back()->with('message', 'Legal information updated successfully.');
}
    /**
     * Update Alerts Settings
     */
    public function updateAlerts(Request $request)
    {
        $validated = $request->validate([
            'low_stock_to_emails' => 'nullable|string',
            'low_stock_cc_emails' => 'nullable|string',
            'low_stock_bcc_emails' => 'nullable|string',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Alerts settings updated successfully.');
    }

// Update Accounting Settings

public function updateAccounting(Request $request)
{
    $validated = $request->validate([
        'acct_method' => 'required|string|max:50',
        'fin_year_start' => 'required|string|max:20',
        'tax_year_start' => 'required|string|max:50',
        'close_books' => 'required|boolean',
        'tax_form' => 'required|string|max:100',
    ]);

    $this->getSettings()->update($validated);
    return back()->with('message', 'Accounting settings updated successfully.');
}

    /**
     * Update Layout Settings
     */
    public function updateLayout(Request $request)
    {
        $validated = $request->validate([
            'pos_layout_enabled' => 'required|boolean',
        ]);

        $this->getSettings()->update($validated);
        return back()->with('message', 'Layout settings updated successfully.');
    }

    public function updateWarrantyLayout(Request $request)
    {
        $validated = $request->validate([
            'warranty_layout_enabled' => 'required|boolean',
        ]);

        $this->getSettings()->update($validated);
        return back()->with('message', 'Warranty layout settings updated successfully.');
    }

    public function updateJobLayout(Request $request)
    {
        $validated = $request->validate([
            'job_layout_enabled' => 'required|boolean',
        ]);

        $this->getSettings()->update($validated);
        return back()->with('message', 'Job layout settings updated successfully.');
    }

    public function updateCustomerLayout(Request $request)
    {
        $validated = $request->validate([
            'customer_layout_modal' => 'required|boolean',
        ]);

        $this->getSettings()->update($validated);
        return back()->with('message', 'Customer layout settings updated successfully.');
    }

    /**
     * Handle Logo Upload
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $company = $this->getActiveCompany();
        if (!$company) {
            return back()->withErrors(['logo' => 'Please save your company information first before uploading a logo.']);
        }

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            $path = $request->file('logo')->store($company->id . '/logo', 'public');
            
            $company->update(['logo_path' => $path]);
        }

        return back()->with('message', 'Logo uploaded successfully.');
    }
}
