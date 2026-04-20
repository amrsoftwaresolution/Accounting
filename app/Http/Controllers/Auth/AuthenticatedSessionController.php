<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Tenant;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();

    $user = $request->user();

    // DEFAULT: tenant dashboard (same domain)
    $redirectUrl = '/dashboard';

    // IF USER HAS TENANT
    if ($user->tenant_id) {

        $tenant = Tenant::with('domains')->find($user->tenant_id);

        $domain = $tenant?->domains?->first()?->domain;

        if ($domain) {

            // IMPORTANT: use SAME host format Laravel expects
            $redirectUrl = "http://{$domain}:8000/dashboard";
        }
    }

    return redirect()->to($redirectUrl);
}

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
