<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Customer;
use App\Models\Address;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::with('addresses')->orderBy('display_name')->get();
        return Inertia::render('Contacts/CustomerIndex', [
            'customers' => $customers
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/CustomerForm');
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

        $customer = Customer::create($validatedData);

        if ($request->filled('billing_address.address_line_1')) {
            $customer->addresses()->create(array_merge($request->billing_address, ['type' => 'billing']));
        }

        if ($request->filled('shipping_address.address_line_1')) {
            $customer->addresses()->create(array_merge($request->shipping_address, ['type' => 'shipping']));
        }

        return redirect()->back()->with('success', 'Customer created successfully.');
    }

    public function update(Request $request, Customer $customer)
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

        $customer->update($validatedData);

        if ($request->filled('billing_address.address_line_1')) {
            $customer->addresses()->updateOrCreate(
                ['type' => 'billing'],
                $request->billing_address
            );
        }

        if ($request->filled('shipping_address.address_line_1')) {
            $customer->addresses()->updateOrCreate(
                ['type' => 'shipping'],
                $request->shipping_address
            );
        }

        return redirect()->back()->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->addresses()->delete();
        $customer->delete();
        return redirect()->back()->with('success', 'Customer deleted successfully.');
    }
}
