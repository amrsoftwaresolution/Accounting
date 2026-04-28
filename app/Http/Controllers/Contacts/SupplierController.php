<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Supplier;
use App\Models\Address;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::with('addresses')->orderBy('display_name')->get();
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
            'billing_address' => 'nullable|array',
            'shipping_address' => 'nullable|array',
        ]);

        $supplier = Supplier::create($validatedData);

        if ($request->filled('billing_address.address_line_1')) {
            $supplier->addresses()->create(array_merge($request->billing_address, ['type' => 'billing']));
        }

        if ($request->filled('shipping_address.address_line_1')) {
            $supplier->addresses()->create(array_merge($request->shipping_address, ['type' => 'shipping']));
        }

        return redirect()->back()->with('success', 'Supplier created successfully.');
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
            'billing_address' => 'nullable|array',
            'shipping_address' => 'nullable|array',
        ]);

        $supplier->update($validatedData);

        if ($request->filled('billing_address.address_line_1')) {
            $supplier->addresses()->updateOrCreate(
                ['type' => 'billing'],
                $request->billing_address
            );
        }

        if ($request->filled('shipping_address.address_line_1')) {
            $supplier->addresses()->updateOrCreate(
                ['type' => 'shipping'],
                $request->shipping_address
            );
        }

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->addresses()->delete();
        $supplier->delete();
        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }
}
