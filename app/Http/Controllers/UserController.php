<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List all users
     */
    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('manager')->get(),
        ]);
    }

    /**
     * Show form to create a new user
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'managers' => User::where('role', 'admin')->get(['id', 'name']),
        ]);
    }

    /**
     * Store the new user
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|confirmed|min:8',
            'role' => 'required|in:admin,user',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'is_active' => true,
        ]);

        // Link to active company
        $activeCompanyId = session('active_company_id');
        if ($activeCompanyId) {
            $user->companies()->attach($activeCompanyId, ['role' => $request->role]);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully');
    }
}
