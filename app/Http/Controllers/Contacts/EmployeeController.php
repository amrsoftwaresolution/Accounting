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
        $employees = Employee::with('user')->get();
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
            'email' => 'required|email|unique:users,email',
            'designation' => 'required|string|max:255',
            'salary' => 'nullable|numeric',
            'join_date' => 'nullable|date',
            'role' => 'required|string|in:admin,user,manager',
        ]);

        // Create User first
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make('password123'), // Default password
            'role' => $request->role,
        ]);

        // Create Employee record
        $user->employee()->create([
            'designation' => $request->designation,
            'salary' => $request->salary,
            'join_date' => $request->join_date,
            'employee_id' => 'EMP-' . rand(1000, 9999),
        ]);

        return redirect()->back()->with('success', 'Employee and User account created successfully.');
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'salary' => 'nullable|numeric',
        ]);

        $employee->user->update(['name' => $request->name]);
        $employee->update($request->only(['designation', 'salary', 'join_date']));

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->user->delete(); // This will delete the employee too if cascading, or handle manually
        $employee->delete();
        return redirect()->back()->with('success', 'Employee removed successfully.');
    }
}
