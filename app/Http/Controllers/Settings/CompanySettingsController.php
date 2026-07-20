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
        $company = $this->getActiveCompany();
        if (!$company) {
            // Fallback or handle error
            return null;
        }
        return CompanySetting::firstOrCreate([]);
    }

    public function index()
    {
        $company = $this->getActiveCompany();
        if (!$company) return redirect()->route('dashboard');

        $settings = $this->getSettings();

        // Merge company info and specific settings
        $mergedData = array_merge($company->toArray(), $settings->toArray(), [
            'settings_metadata' => [
                'expenses' => [
                    'show_tags' => $settings->show_tags,
                    'bill_payment_terms' => $settings->bill_payment_terms,
                ],
                'sales' => \App\Models\SalesSetting::firstOrCreate([])->toArray(),
                'advanced' => \App\Models\AdvancedSettings::first() ? \App\Models\AdvancedSettings::first()->toArray() : [],
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
        ]);

        $this->getActiveCompany()->update($validated);

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

        $this->getActiveCompany()->update($validated);

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
            return back()->withErrors(['logo' => 'No active company session found.']);
        }

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            $path = $request->file('logo')->store($company->slug, 'public');
            
            $company->update(['logo_path' => $path]);
        }

        return back()->with('message', 'Logo uploaded successfully.');
    }
}
