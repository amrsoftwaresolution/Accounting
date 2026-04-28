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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ERP Routes
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    Route::get('/expense', [\App\Http\Controllers\Accounting\ExpenseController::class, 'create'])->name('expense');
    Route::get('/journal', [\App\Http\Controllers\Accounting\JournalEntryController::class, 'create'])->name('journal');
    Route::get('/transfer', [\App\Http\Controllers\Accounting\TransferController::class, 'create'])->name('transfer');
    Route::post('/transfer', [\App\Http\Controllers\Accounting\TransferController::class, 'store'])->name('transfer.store');
    Route::get('/invoice', [\App\Http\Controllers\Accounting\InvoiceController::class, 'create'])->name('invoice');
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

require __DIR__.'/auth.php';
