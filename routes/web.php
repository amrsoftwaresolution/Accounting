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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Accounting Routes
    Route::get('/expense', [\App\Http\Controllers\Accounting\ExpenseController::class, 'create'])->name('expense');
    Route::post('/expense', [\App\Http\Controllers\Accounting\ExpenseController::class, 'store'])->name('expense.store');
    Route::get('/expense/{journalEntry}/edit', [\App\Http\Controllers\Accounting\ExpenseController::class, 'edit'])->name('expense.edit');
    Route::patch('/expense/{journalEntry}', [\App\Http\Controllers\Accounting\ExpenseController::class, 'update'])->name('expense.update');

    // API Lookups
    Route::get('/api/payees', [\App\Http\Controllers\Api\LookupController::class, 'payees'])->name('api.payees');
    Route::get('/api/accounts', [\App\Http\Controllers\Api\LookupController::class, 'accounts'])->name('api.accounts');
    Route::get('/api/accounts/next-code', [\App\Http\Controllers\Api\LookupController::class, 'nextCode'])->name('api.accounts.next-code');
    Route::post('/api/accounts/save-date', [\App\Http\Controllers\Api\LookupController::class, 'saveOpeningBalanceDate'])->name('api.accounts.save-date');
    Route::get('/api/items', [\App\Http\Controllers\Api\LookupController::class, 'items'])->name('api.items');
    Route::get('/api/items/create-options', [\App\Http\Controllers\Api\LookupController::class, 'itemCreateOptions'])->name('api.items.create-options');
    Route::get('/api/customers/{customer}', [\App\Http\Controllers\Api\LookupController::class, 'customerInfo'])->name('api.customers.info');
    Route::get('/api/customers/{customer}/invoices', [\App\Http\Controllers\Api\LookupController::class, 'customerInvoices'])->name('api.customers.invoices');
    Route::get('/api/categories', [\App\Http\Controllers\Api\LookupController::class, 'categories'])->name('api.categories');
    Route::get('/api/history/{transactionType}', [\App\Http\Controllers\Api\TransactionHistoryController::class, 'index'])->name('api.history');
    Route::get('/history/{transactionType}', [\App\Http\Controllers\Api\TransactionHistoryController::class, 'page'])->name('history.index');

    Route::resource('journal-entries', \App\Http\Controllers\Accounting\JournalEntryController::class);
    Route::post('/journal-entries/{journalEntry}/quick-update', [\App\Http\Controllers\Accounting\JournalEntryController::class, 'quickUpdate'])->name('journal-entries.quick-update');
    Route::get('/journal', [\App\Http\Controllers\Accounting\JournalEntryController::class, 'create'])->name('journal');

    Route::get('/transfer', [\App\Http\Controllers\Accounting\TransferController::class, 'create'])->name('transfer');
    Route::post('/transfer', [\App\Http\Controllers\Accounting\TransferController::class, 'store'])->name('transfer.store');

    Route::get('/invoice', [\App\Http\Controllers\Accounting\InvoiceController::class, 'create'])->name('invoice');
    Route::post('/invoice', [\App\Http\Controllers\Accounting\InvoiceController::class, 'store'])->name('invoice.store');
    Route::get('/invoice/{journalEntry}/edit', [\App\Http\Controllers\Accounting\InvoiceController::class, 'edit'])->name('invoice.edit');
    Route::patch('/invoice/{journalEntry}', [\App\Http\Controllers\Accounting\InvoiceController::class, 'update'])->name('invoice.update');

    Route::get('/bill', [\App\Http\Controllers\Accounting\BillController::class, 'create'])->name('bill');
    Route::post('/bill', [\App\Http\Controllers\Accounting\BillController::class, 'store'])->name('bill.store');
    Route::get('/bill/{journalEntry}/edit', [\App\Http\Controllers\Accounting\BillController::class, 'edit'])->name('bill.edit');
    Route::patch('/bill/{journalEntry}', [\App\Http\Controllers\Accounting\BillController::class, 'update'])->name('bill.update');

    Route::get('/payment', [\App\Http\Controllers\Accounting\ReceivePaymentController::class, 'create'])->name('payment');
    Route::post('/payment', [\App\Http\Controllers\Accounting\ReceivePaymentController::class, 'store'])->name('payment.store');

    Route::get('/receipt', [\App\Http\Controllers\Accounting\SalesReceiptController::class, 'create'])->name('receipt');
    Route::post('/receipt', [\App\Http\Controllers\Accounting\SalesReceiptController::class, 'store'])->name('receipt.store');

    // Bank Deposit
    Route::get('/deposit', [\App\Http\Controllers\Accounting\BankDepositController::class, 'create'])->name('deposit');
    Route::post('/deposit', [\App\Http\Controllers\Accounting\BankDepositController::class, 'store'])->name('deposit.store');

    Route::get('/credit-note', [\App\Http\Controllers\Accounting\CreditNoteController::class, 'create'])->name('credit-note');
    Route::post('/credit-note', [\App\Http\Controllers\Accounting\CreditNoteController::class, 'store'])->name('credit-note.store');

    Route::get('/SupplierCredit', [\App\Http\Controllers\Accounting\SupplierCreditController::class, 'create'])->name('supplier-credit');
    Route::post('/SupplierCredit', [\App\Http\Controllers\Accounting\SupplierCreditController::class, 'store'])->name('supplier-credit.store');

    // Inventory Routes
    Route::resource('items', \App\Http\Controllers\Inventory\ItemController::class);
    Route::resource('item-categories', \App\Http\Controllers\Inventory\ItemCategoryController::class);
    Route::get('/inventory-adjustment', [\App\Http\Controllers\Inventory\InventoryQuantityAdjustmentController::class, 'create'])->name('inventory-adjustment');
    Route::post('/inventory-adjustment', [\App\Http\Controllers\Inventory\InventoryQuantityAdjustmentController::class, 'store'])->name('inventory-adjustment.store');

    // Contacts Routes
    Route::resource('customers', \App\Http\Controllers\Contacts\CustomerController::class);
    Route::resource('suppliers', \App\Http\Controllers\Contacts\SupplierController::class);
    Route::resource('employees', \App\Http\Controllers\Contacts\EmployeeController::class);

    // Chart of Accounts
    Route::get('chart-of-account/{chart_of_account}/history', [\App\Http\Controllers\Accounting\ChartOfAccController::class, 'history'])->name('chart-of-account.history');
    Route::resource('chart-of-account', \App\Http\Controllers\Accounting\ChartOfAccController::class);

    // Settings
    Route::get('/settings', [\App\Http\Controllers\Settings\CompanySettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/company', [\App\Http\Controllers\Settings\CompanySettingsController::class, 'update'])->name('company.update');
    Route::post('/settings/legal', [\App\Http\Controllers\Settings\CompanySettingsController::class, 'updateLegal'])->name('legal.update');
    Route::post('/settings/currency', [\App\Http\Controllers\Settings\CompanySettingsController::class, 'updateCurrency'])->name('currency.update');
    Route::post('/settings/time', [\App\Http\Controllers\Settings\CompanySettingsController::class, 'updateTime'])->name('time.settings.update');
    Route::post('/settings/expense', [\App\Http\Controllers\Settings\CompanySettingsController::class, 'updateExpense'])->name('expense.settings.update');
    Route::post('/settings/sales', [\App\Http\Controllers\Settings\SalesSettingController::class, 'update'])->name('sales.settings.update');
    Route::post('/settings/advanced', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'update'])->name('advanced.settings.update');
    Route::post('/settings/logo', [\App\Http\Controllers\Settings\CompanySettingsController::class, 'uploadLogo'])->name('logo.upload');

    // Onboarding
    Route::get('/onboarding', [\App\Http\Controllers\Settings\OnboardingController::class, 'index'])->name('onboarding');
    Route::post('/onboarding/complete', [\App\Http\Controllers\Settings\OnboardingController::class, 'complete'])->name('onboarding.complete');

    // Users
    Route::resource('users', \App\Http\Controllers\UserController::class);
    Route::post('/users/{user}/resend-invite', [\App\Http\Controllers\UserController::class, 'resendInvitation'])->name('users.resend-invite');

    // Reports
    Route::get('/reports/profit-loss', [\App\Http\Controllers\Accounting\ReportController::class, 'profitAndLoss'])->name('reports.profit-loss');
    Route::get('/reports/balance-sheet', [\App\Http\Controllers\Accounting\ReportController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('/reports/customer-balance', [\App\Http\Controllers\Accounting\ReportController::class, 'customerBalance'])->name('reports.customer-balance');
    Route::get('/reports/supplier-balance', [\App\Http\Controllers\Accounting\ReportController::class, 'supplierBalance'])->name('reports.supplier-balance');

    // Companies
    Route::resource('companies', \App\Http\Controllers\CompanyController::class);
    Route::post('/companies/{company}/switch', [\App\Http\Controllers\CompanyController::class, 'switch'])->name('companies.switch');

    // Super Admin route
    Route::middleware(['auth', 'super.admin'])->group(function () {

    // Packages
    Route::resource('packages', \App\Http\Controllers\PackageController::class);
    //compenies
    Route::get('/Company/AdminIndex', [\App\Http\Controllers\CompanyController::class, 'adminIndex'])->name('admin.companies.index');
});

});

require __DIR__.'/auth.php';
