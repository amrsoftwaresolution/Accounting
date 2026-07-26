<?php

namespace App\Http\Controllers\Garage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::orderBy('brand')->get();
        return Inertia::render('vehicle/Index', [
            'vehicles' => $vehicles
        ]);
    }

    public function create()
    {
        return Inertia::render('vehicle/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_type' => 'required|string|max:100',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'fuel_type' => 'required|string|max:100',
        ]);

        Vehicle::create($validated);

        return redirect()->route('vehicles.index')->with('success', 'Vehicle registered successfully.');
    }

    public function edit(Vehicle $vehicle)
    {
        return Inertia::render('vehicle/Form', [
            'vehicle' => $vehicle,
        ]);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'vehicle_type' => 'required|string|max:100',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'fuel_type' => 'required|string|max:100',
        ]);

        $vehicle->update($validated);

        return redirect()->route('vehicles.index')->with('success', 'Vehicle updated successfully.');
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();
        return redirect()->back()->with('success', 'Vehicle deleted successfully.');
    }
}