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
            'settings' => fn () => \App\Models\AdvancedSettings::first() ?? [],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info' => fn() => $request->session()->get('info'),
                'new_customer' => fn() => $request->session()->get('new_customer'),
                'new_supplier' => fn() => $request->session()->get('new_supplier'),
                'new_employee' => fn() => $request->session()->get('new_employee'),
                'new_account' => fn() => $request->session()->get('new_account'),
                'new_method' => fn() => $request->session()->get('new_method'),
                'journal_entry_id' => fn() => $request->session()->get('journal_entry_id'),
],
        ];
    }
}
