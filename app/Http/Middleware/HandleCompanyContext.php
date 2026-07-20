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
                return redirect()->route('dashboard');
            } else {
                $currentCompany = \App\Models\Company::first();
                if ($currentCompany) {
                    session(['active_company_id' => $currentCompany->id]);
                    Inertia::share('auth.company', $currentCompany);
                }
            }
        }

        return $next($request);
    }
}
