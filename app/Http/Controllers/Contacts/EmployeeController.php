<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::all();
        return Inertia::render('Team/EmployeeIndex', [
            'employees' => $employees
        ]);
    }

    public function create()
    {
        return Inertia::render('Team/EmployeeForm');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:employees,email',
            'designation' => 'required|string|max:255',
            'salary' => 'nullable|numeric',
            'join_date' => 'nullable|date',
        ]);

        // Create Employee record directly
        Employee::create([
            'name' => $request->name,
            'email' => $request->email,
            'designation' => $request->designation,
            'salary' => $request->salary,
            'join_date' => $request->join_date,
            'employee_id' => 'EMP-' . rand(1000, 9999),
        ]);

        return redirect()->back()->with([
            'success' => 'Employee created successfully.',
            'new_employee' => [
                'value' => $employee->id,
                'label' => $employee->name,
                'type' => 'Employee'
            ]
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:employees,email,' . $employee->id,
            'designation' => 'required|string|max:255',
            'salary' => 'nullable|numeric',
            'join_date' => 'nullable|date',
        ]);

        $employee->update($request->only(['name', 'email', 'designation', 'salary', 'join_date']));

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->back()->with('success', 'Employee removed successfully.');
    }
}
