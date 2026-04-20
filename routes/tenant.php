<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

use App\Http\Controllers\Accounting\ChartOfAccController;
use App\Http\Controllers\Team\TeamController;
use App\Http\Controllers\Accounting\JournalEntryController;

use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| TENANT ROUTES (MAIN APP)
|--------------------------------------------------------------------------
*/
Route::middleware([
    'web',
    Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
    Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
])->group(function () {

    Route::get('/', function () {
        return redirect('/dashboard');
    });

    Route::get('/dashboard', fn () =>
        Inertia::render('Dashboard')
    )->middleware('auth')->name('dashboard');

    Route::middleware('auth')->group(function () {

        Route::get('/expense', fn () => Inertia::render('Transaction/ExpenseForm'))->name('expense');
        Route::get('/journal', fn () => Inertia::render('Transaction/JournalEntryForm'))->name('journal');
        Route::get('/transfer', fn () => Inertia::render('Transaction/TransferForm'))->name('transfer');
        Route::get('/invoice', fn () => Inertia::render('Transaction/InvoiceForm'))->name('invoice');
        Route::get('/payment', fn () => Inertia::render('Transaction/ReceivePaymentForm'))->name('payment');

        Route::resource('chart-of-account', ChartOfAccController::class);
        Route::resource('team', TeamController::class);
        Route::resource('journal-entries', JournalEntryController::class);
    });

});
