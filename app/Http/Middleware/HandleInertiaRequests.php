<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Closure;

class HandleInertiaRequests extends Middleware
{
    /**
     * Prevent browser from caching Inertia JSON responses which causes the raw JSON bug on Back button.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = parent::handle($request, $next);
        
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        
        return $response;
    }
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'company' => $request->user() ? $request->user()->currentCompany() : null,
                'companies' => $request->user() ? $request->user()->cached_companies : [],
            ],
            'appName' => config('app.name'),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                'new_customer' => $request->session()->get('new_customer'),
                'new_supplier' => $request->session()->get('new_supplier'),
                'new_employee' => $request->session()->get('new_employee'),
                'new_account' => $request->session()->get('new_account'),
                'new_method' => $request->session()->get('new_method'),
            ],
        ];
    }
}
