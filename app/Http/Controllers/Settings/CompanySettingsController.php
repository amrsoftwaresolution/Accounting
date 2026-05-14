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
        $companyId = session('active_company_id');
        return \App\Models\Company::find($companyId);
    }

    private function getSettings()
    {
        $company = $this->getActiveCompany();
        if (!$company) {
            // Fallback or handle error
            return null;
        }
        return CompanySetting::firstOrCreate(['company_id' => $company->id]);
    }

    public function index()
    {
        $company = $this->getActiveCompany();
        if (!$company) return redirect()->route('dashboard');

        $settings = $this->getSettings();

        // Merge company info and specific settings
        $mergedData = array_merge($company->toArray(), $settings->toArray(), [
            'settings_metadata' => [
                'time' => [
                    'work_week_start' => $settings->work_week_start,
                    'show_service_field' => $settings->show_service_field,
                    'allow_billable_time' => $settings->allow_billable_time,
                    'show_billing_rate' => $settings->show_billing_rate,
                ],
                'expenses' => [
                    'show_tags' => $settings->show_tags,
                    'bill_payment_terms' => $settings->bill_payment_terms,
                ],
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
     * Update Currency Settings
     */
    public function updateCurrency(Request $request)
    {
        $validated = $request->validate([
            'home_currency' => 'required|string',
            'home_currency_prefix' => 'nullable|string|max:10',
            'multicurrency' => 'required|boolean',
        ]);

        $this->getActiveCompany()->update($validated);

        return back()->with('message', 'Currency settings updated successfully.');
    }

    /**
     * Update Time Settings
     */
    public function updateTime(Request $request)
    {
        $validated = $request->validate([
            'work_week_start' => 'required|string|max:20',
            'show_service_field' => 'required|boolean',
            'allow_billable_time' => 'required|boolean',
            'show_billing_rate' => 'required|boolean',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Time settings updated successfully.');
    }

    /**
     * Update Expense Settings
     */
    public function updateExpense(Request $request)
    {
        $validated = $request->validate([
            'show_tags' => 'required|boolean',
            'bill_payment_terms' => 'required|string|max:50',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Expense settings updated successfully.');
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
            $company = $this->getActiveCompany();
            // Delete old logo if it exists
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            $path = $request->file('logo')->store('companies/' . $company->slug, 'public');
            $company->update(['logo_path' => $path]);
        }

        return back()->with('message', 'Logo uploaded successfully.');
    }
}
