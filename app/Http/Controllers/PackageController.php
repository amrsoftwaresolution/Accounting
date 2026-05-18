<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::all();
        return Inertia::render('Packages/Index', [
            'packages' => $packages
        ]);
    }

    public function create()
    {
        return Inertia::render('Packages/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:weekly,monthly,yearly',
            'max_companies' => 'required|integer|min:1',
            'max_chart_of_accounts' => 'nullable|integer|min:1',
            'max_products' => 'nullable|integer|min:1',
            'max_users' => 'nullable|integer|min:1',
            'max_invoices_per_month' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        Package::create($validated);

        return redirect()->route('packages.index')->with('success', 'Package created successfully.');
    }

    public function edit(Package $package)
    {
        return Inertia::render('Packages/Edit', [
            'package' => $package
        ]);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:weekly,monthly,yearly',
            'max_companies' => 'required|integer|min:1',
            'max_chart_of_accounts' => 'nullable|integer|min:1',
            'max_products' => 'nullable|integer|min:1',
            'max_users' => 'nullable|integer|min:1',
            'max_invoices_per_month' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $package->update($validated);

        return redirect()->route('packages.index')->with('success', 'Package updated successfully.');
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return redirect()->route('packages.index')->with('success', 'Package deleted successfully.');
    }
}
