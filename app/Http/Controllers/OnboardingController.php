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
                $company = Company::findOrFail($companyId);
        $salesSettings = SalesSetting::firstOrCreate([]);

        return Inertia::render('Settings/Onboarding', [
            'company' => $company,
            'salesSettings' => $salesSettings
        ]);
    }

    public function complete(Request $request)
    {
        return redirect()->route('dashboard')->with('message', 'Setup complete! Welcome aboard.');
    }
}
