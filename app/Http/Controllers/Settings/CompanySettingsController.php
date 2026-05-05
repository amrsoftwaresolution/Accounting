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
    private function getSettings()
    {
        $companyId = session('active_company_id');
        return \App\Models\Company::findOrFail($companyId);
    }

    public function index()
    {
        return Inertia::render('Settings/Index', [
            'settings' => $this->getSettings(),
            'tab' => request('tab', 'company')
        ]);
    }

    /**
     * Update General Company Info
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name'  => 'required|string|max:255',
            'company_email' => 'nullable|email',
            'phone'         => 'nullable|string',
            'address'       => 'nullable|string',
            'website'       => 'nullable|string',
            'industry'      => 'nullable|string',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Company information updated successfully.');
    }

    /**
     * Update Legal & Tax Info
     */
    public function updateLegal(Request $request)
    {
        $validated = $request->validate([
            'legal_name'    => 'nullable|string|max:255',
            'tax_id'        => 'nullable|string|max:100', // Matches your React data.tax_id
            'business_type' => 'nullable|string',
            'legal_address' => 'nullable|string',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Legal information updated successfully.');
    }

    /**
     * Update Currency Settings
     */
    public function updateCurrency(Request $request)
    {
        $validated = $request->validate([
            'home_currency' => 'required|string',
            'home_currency_prefix' => 'nullable|string|max:10',
            'multicurrency' => 'required|boolean',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Currency settings updated successfully.');
    }

    /**
     * Handle Logo Upload
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $settings = $this->getSettings();

        if ($request->hasFile('logo')) {
            // Delete old logo if it exists to save space
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }

            $path = $request->file('logo')->store('logos', 'public');
            $settings->update(['logo_path' => $path]);
        }

        return back()->with('message', 'Logo uploaded successfully.');
    }
}
