<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SalesSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function index()
    {
                $company = \App\Models\Company::findOrFail($companyId);
        $salesSettings = SalesSetting::query()->first();
        $currencies = [];

        return Inertia::render('Settings/Onboarding', [
            'company' => $company,
            'salesSettings' => $salesSettings,
            'currencies' => $currencies,
        ]);
    }

    public function complete()
    {
                $company = \App\Models\Company::findOrFail($companyId);
        
        $company->update(['is_onboarded' => true]);

        return redirect()->route('dashboard')->with('message', 'Onboarding completed!');
    }
}
