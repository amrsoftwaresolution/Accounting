<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AdvancedSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvancedSettingsController extends Controller
{
    /**
     * Helper to get the single settings record or create one if it doesn't exist.
     */
    private function getSettings()
    {
        return AdvancedSettings::first() ?? AdvancedSettings::create([
            'acct_method' => 'Accrual',
            'fin_year_start' => 'January',
            'tax_year_start' => 'Same as financial year',
            'close_books' => false,
            'tax_form' => 'Partnership or limited liability company',
            'enable_acct_nums' => false,
            'discount_acct' => 'Discounts given',
            'auto_prefill' => false,
            'auto_invoice_groups' => false,
            'auto_apply_bills' => false,
            'language' => 'English',
            'date_format' => 'mm/dd/yyyy',
            'currency_format' => '$123,456.00',
            'warn_dup_cheque' => false,
            'warn_dup_bill' => false,
            'warn_dup_journal' => false,
            'sign_out_inactive' => '1 hour',
        ]);
    }

    /**
     * Display the advanced settings page.
     */
    public function index()
    {
        return Inertia::render('Settings/Advanced', [
            'settings' => $this->getSettings(),
        ]);
    }

    /**
     * Update the advanced settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'acct_method' => 'required|string|max:50',
            'fin_year_start' => 'required|string|max:20',
            'tax_year_start' => 'required|string|max:50',
            'close_books' => 'required|boolean',
            'tax_form' => 'required|string|max:100',
            'enable_acct_nums' => 'required|boolean',
            'discount_acct' => 'required|string|max:100',
            'auto_prefill' => 'required|boolean',
            'auto_invoice_groups' => 'required|boolean',
            'auto_apply_bills' => 'required|boolean',
            'language' => 'required|string|max:20',
            'date_format' => 'required|string|max:20',
            'currency_format' => 'required|string|max:20',
            'warn_dup_cheque' => 'required|boolean',
            'warn_dup_bill' => 'required|boolean',
            'warn_dup_journal' => 'required|boolean',
            'sign_out_inactive' => 'required|string|max:20',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Advanced settings updated successfully.');
    }
}
