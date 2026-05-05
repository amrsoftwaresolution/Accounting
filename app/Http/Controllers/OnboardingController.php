<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\SalesSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function index()
    {
        $companyId = session('active_company_id');
        $company = Company::findOrFail($companyId);
        $salesSettings = SalesSetting::firstOrCreate(['company_id' => $companyId]);

        return Inertia::render('Settings/Onboarding', [
            'company' => $company,
            'salesSettings' => $salesSettings
        ]);
    }

    public function complete(Request $request)
    {
        // Mark onboarding as complete (maybe add a field to companies table)
        // For now, just redirect to dashboard
        return redirect()->route('dashboard')->with('message', 'Setup complete! Welcome aboard.');
    }
}
