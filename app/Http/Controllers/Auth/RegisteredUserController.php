<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show registration page
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle registration
     */
    public function store(Request $request)
    {
        // 1. VALIDATION
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|confirmed|min:8',
            'company' => 'required|string|max:255',
        ]);

        // 2. CLEAN COMPANY NAME (SAFE DOMAIN SLUG)
        $cleanCompany = strtolower(
            preg_replace('/[^a-zA-Z0-9]/', '', $request->company)
        );

        // fallback if empty
        if (!$cleanCompany) {
            $cleanCompany = 'company';
        }

        // 3. CREATE TENANT (DATABASE + IDENTIFIER)
        $tenant = Tenant::create([
            'name' => $request->company,
        ]);

        // 4. CREATE DOMAIN
        $domain = $cleanCompany . '.localhost';

        $tenant->domains()->create([
            'domain' => $domain,
        ]);

        // 5. CREATE USER (CENTRAL DB)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            // IMPORTANT: link user → tenant
            'tenant_id' => $tenant->id,
        ]);

        // 6. OPTIONAL: LOGIN USER AFTER REGISTRATION
        // Auth::login($user);

        // 7. REDIRECT TO LOGIN (central)
        return redirect('/login')->with('success', 'Account created successfully');
    }
}
