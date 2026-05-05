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
     * Helper to get the single settings record or create one if it doesn't exist.
     */
    private function getSettings()
    {
        return CompanySetting::first() ?? CompanySetting::create([
            'company_name' => 'My Company',
            'home_currency' => 'USD',
            'multicurrency' => false,
            'work_week_start' => 'Monday',
            'show_service_field' => true,
            'allow_billable_time' => true,
            'show_billing_rate' => false,
        ]);
    }

    public function index()
    {
        $settings = $this->getSettings();

        return Inertia::render('Settings/Index', [
            'settings' => array_merge($settings->toArray(), [
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
            ]),
            'tab' => request('tab', 'company'),
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
            'multicurrency' => 'required|boolean',
        ]);

        $this->getSettings()->update($validated);

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
