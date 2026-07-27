<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Supplier;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::orderBy('display_name')->get();
        return Inertia::render('Contacts/SupplierIndex', [
            'suppliers' => $suppliers
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/SupplierForm');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'display_name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $supplier = Supplier::create($validatedData);

        return redirect()->back()->with([
            'success' => 'Supplier created successfully.',
            'new_supplier' => [
                'value' => $supplier->id,
                'label' => $supplier->display_name,
                'type' => 'Supplier'
            ]
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validatedData = $request->validate([
            'display_name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $supplier->update($validatedData);

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }
}
