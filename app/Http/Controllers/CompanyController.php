<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Services\CompanySetupService;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Auth::user()->companies;
        return Inertia::render('Company/Select', [
            'companies' => $companies
        ]);
    }

    public function adminIndex()
    {
        $companies = Company::with('package')->get();
        return Inertia::render('Company/AdminIndex', [
            'companies' => $companies
        ]);
    }

    public function create()
    {
        abort_unless(Auth::user()->role === 'admin', 403);

        return Inertia::render('Company/Create');
    }

    public function store(Request $request)
    {
        abort_unless(Auth::user()->role === 'admin', 403);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'industry' => 'nullable|string|max:255',
        ]);

        $company = Company::create($validated);

        // Link user to company as admin
        Auth::user()->companies()->attach($company->id, ['role' => 'admin']);

        // Set as active company
        session(['active_company_id' => $company->id]);

        // Initialize default data
        CompanySetupService::setup($company);

        return redirect()->route('onboarding');
    }

    public function switch(Company $company)
    {
        // Verify user has access to this company
        if (!Auth::user()->companies->contains($company->id)) {
            abort(403);
        }

        session(['active_company_id' => $company->id]);

        return redirect()->route('dashboard');
    }

    public function show(Company $company)
    {
        // Load the assigned package
        $company->load('package');

        $packages = \App\Models\Package::where('is_active', true)->get();

        return Inertia::render('Company/Show', [
            'company' => $company,
            'packages' => $packages
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
        ]);

        $company->update($validated);

        return back()->with('success', 'Company package updated successfully.');
    }
}
