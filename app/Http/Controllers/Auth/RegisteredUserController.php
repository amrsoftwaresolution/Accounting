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

    public function store(Request $request)
    {
        // 1. VALIDATION
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|confirmed|min:8',
            'company' => 'required|string|max:255',
        ]);

        $cleanCompany = strtolower(
            preg_replace('/[^a-zA-Z0-9]/', '', $request->company)
        );

        if (!$cleanCompany) {
            $cleanCompany = 'company';
        }

        $tenant = Tenant::create([
            'name' => $request->company,
        ]);

        $domain = $cleanCompany . '.localhost';

        $tenant->domains()->create([
            'domain' => $domain,
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            'tenant_id' => $tenant->id,
        ]);

        return redirect('/login')->with('success', 'Account created successfully');
    }
}
