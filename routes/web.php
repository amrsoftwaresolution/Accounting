<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

use App\Http\Controllers\Accounting\ChartOfAccController;
use App\Http\Controllers\Team\TeamController;
use App\Http\Controllers\Accounting\JournalEntryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Settings\CompanySettingsController;
use App\Http\Controllers\Settings\LogoUploadController;
use App\Http\Controllers\Settings\SalesSettingController;

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\Accounting\ReportController;

Route::middleware(['auth', 'verified', \App\Http\Middleware\HandleCompanyContext::class])->group(function () {
    Route::get('/reports/profit-and-loss', [ReportController::class, 'profitAndLoss'])->name('reports.profit-loss');
    Route::get('/reports/balance-sheet', [ReportController::class, 'balanceSheet'])->name('reports.balance-sheet');

    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create');
    Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
    Route::post('/companies/{company}/switch', [CompanyController::class, 'switch'])->name('companies.switch');

    Route::get('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'index'])->name('onboarding');
    Route::post('/onboarding/complete', [\App\Http\Controllers\OnboardingController::class, 'complete'])->name('onboarding.complete');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ERP Routes
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    Route::get('/expense', [\App\Http\Controllers\Accounting\ExpenseController::class, 'create'])->name('expense');
    Route::post('/expense', [\App\Http\Controllers\Accounting\ExpenseController::class, 'store'])->name('expense.store');
    Route::get('/expense/{journalEntry}/edit', [\App\Http\Controllers\Accounting\ExpenseController::class, 'edit'])->name('expense.edit');
    Route::patch('/expense/{journalEntry}', [\App\Http\Controllers\Accounting\ExpenseController::class, 'update'])->name('expense.update');
    Route::get('/api/payees', [\App\Http\Controllers\Api\LookupController::class, 'payees'])->name('api.payees');
    Route::get('/journal', [\App\Http\Controllers\Accounting\JournalEntryController::class, 'create'])->name('journal');
    Route::get('/transfer', [\App\Http\Controllers\Accounting\TransferController::class, 'create'])->name('transfer');
    Route::post('/transfer', [\App\Http\Controllers\Accounting\TransferController::class, 'store'])->name('transfer.store');
    Route::get('/invoice', [\App\Http\Controllers\Accounting\InvoiceController::class, 'create'])->name('invoice');
    Route::post('/invoice', [\App\Http\Controllers\Accounting\InvoiceController::class, 'store'])->name('invoice.store');
    Route::get('/invoice/{journalEntry}/edit', [\App\Http\Controllers\Accounting\InvoiceController::class, 'edit'])->name('invoice.edit');
    Route::patch('/invoice/{journalEntry}', [\App\Http\Controllers\Accounting\InvoiceController::class, 'update'])->name('invoice.update');
    Route::get('/bill', [\App\Http\Controllers\Accounting\BillController::class, 'create'])->name('bill');
    Route::get('/payment', [\App\Http\Controllers\Accounting\ReceivePaymentController::class, 'create'])->name('payment');

    Route::get('chart-of-account/{chartOfAccount}/history', [\App\Http\Controllers\Accounting\ChartOfAccController::class, 'history'])->name('chart-of-account.history');
    Route::resource('chart-of-account', ChartOfAccController::class);
    Route::resource('team', TeamController::class);
    Route::resource('journal-entries', JournalEntryController::class);

    // Contacts
    Route::resource('customers', \App\Http\Controllers\Contacts\CustomerController::class);
    Route::resource('suppliers', \App\Http\Controllers\Contacts\SupplierController::class);
    Route::resource('employees', \App\Http\Controllers\Contacts\EmployeeController::class);

    // Inventory
    Route::resource('items', \App\Http\Controllers\Inventory\ItemController::class);
    Route::resource('item-categories', \App\Http\Controllers\Inventory\ItemCategoryController::class);

    // User Management (Admin Only)
    Route::middleware('admin')->group(function () {
        Route::resource('users', UserController::class);
    });
});

Route::get('/Settings/Index', [CompanySettingsController::class, 'index'])->name('settings.index');
Route::post('/settings/company', [CompanySettingsController::class, 'update'])->name('company.update');
Route::post('/settings/legal', [CompanySettingsController::class, 'updateLegal'])->name('legal.update');
Route::post('/settings/currency', [CompanySettingsController::class, 'updateCurrency'])->name('currency.update');
Route::get('/settings/sales', [SalesSettingController::class, 'index'])->name('sales.settings.index');
Route::post('/settings/sales', [SalesSettingController::class, 'update'])->name('sales.settings.update');
Route::post('/settings/logo-upload', [LogoUploadController::class, 'upload'])->name('logo.upload');
require __DIR__.'/auth.php';
