<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HandleCompanyContext
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            if (Auth::user()->role === 'super_admin') {
                $allowedRoutes = [
                    'admin.companies.index',
                    'packages.index',
                    'packages.create',
                    'packages.store',
                    'packages.show',
                    'packages.edit',
                    'packages.update',
                    'packages.destroy',
                    'companies.show',
                    'companies.edit',
                    'companies.update',
                    'profile.edit',
                    'profile.update',
                    'profile.destroy',
                    'logout',
                ];

                $currentRouteName = $request->route() ? $request->route()->getName() : null;

                if (!in_array($currentRouteName, $allowedRoutes)) {
                    return redirect()->route('admin.companies.index');
                }
            } else {
                if (!session()->has('active_company_id')) {
                    if (!$request->routeIs('companies.*') && !$request->routeIs('logout')) {
                        return redirect()->route('companies.index');
                    }
                }

                // Share current company with Inertia
                if (session()->has('active_company_id')) {
                    $currentCompany = Auth::user()->currentCompany();
                    Inertia::share('auth.company', $currentCompany);
                }
            }
        }

        return $next($request);
    }
}
