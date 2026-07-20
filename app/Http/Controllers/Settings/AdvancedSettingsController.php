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
            'warn_dup_cheque' => 'required|boolean',
            'warn_dup_bill' => 'required|boolean',
            'warn_dup_journal' => 'required|boolean',
            'sign_out_inactive' => 'required|string|max:20',
        ]);

        $this->getSettings()->update($validated);

        return back()->with('message', 'Advanced settings updated successfully.');
    }
}
