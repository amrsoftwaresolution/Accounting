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
            if (!session()->has('active_company_id')) {
                // If the user has only one company, set it automatically
                if (Auth::user()->companies->count() === 1) {
                    session(['active_company_id' => Auth::user()->companies->first()->id]);
                } else if (!$request->routeIs('companies.*') && !$request->routeIs('logout')) {
                    return redirect()->route('companies.index');
                }
            }

            // Share current company with Inertia
            if (session()->has('active_company_id')) {
                $currentCompany = Auth::user()->currentCompany();
                Inertia::share('auth.company', $currentCompany);
            }
        }

        return $next($request);
    }
}
