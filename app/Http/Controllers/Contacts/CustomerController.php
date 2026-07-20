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
        $customers = Customer::with(['addresses', 'devices'])->orderBy('display_name')->get();
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
            'devices' => 'nullable|array',
        ]);

        $customer = Customer::create($validatedData);

        if ($request->filled('billing_address.address_line_1')) {
            $customer->addresses()->create(array_merge($request->billing_address, ['type' => 'billing']));
        }

        if ($request->has('devices') && is_array($request->devices)) {
            foreach ($request->devices as $deviceData) {
                // If it doesn't have an ID, it's new
                if (empty($deviceData['id'])) {
                    $customer->devices()->create(array_merge($deviceData, []));
                }
            }
        }

        return redirect()->back()->with([
            'success' => 'Customer created successfully.',
            'new_customer' => [
                'value' => $customer->id,
                'label' => $customer->display_name,
                'type' => 'Customer'
            ]
        ]);
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
            'devices' => 'nullable|array',
        ]);

        $customer->update($validatedData);

        if ($request->filled('billing_address.address_line_1')) {
            $customer->addresses()->updateOrCreate(
                ['type' => 'billing'],
                $request->billing_address
            );
        }

        if ($request->has('devices') && is_array($request->devices)) {
            $existingDeviceIds = [];
            foreach ($request->devices as $deviceData) {
                if (!empty($deviceData['id'])) {
                    $device = $customer->devices()->find($deviceData['id']);
                    if ($device) {
                        $device->update($deviceData);
                        $existingDeviceIds[] = $device->id;
                    }
                } else {
                    $newDevice = $customer->devices()->create(array_merge($deviceData, []));
                    $existingDeviceIds[] = $newDevice->id;
                }
            }
            // Optional: delete devices that were removed from the form
            // $customer->devices()->whereNotIn('id', $existingDeviceIds)->delete();
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
