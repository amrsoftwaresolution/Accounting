<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Accounting\ChartOfAccController;
use App\Http\Controllers\Team\TeamController;
use App\Http\Controllers\Controller;

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
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
Route::get('/expense', fn () => Inertia::render('Transaction/ExpenseForm'))->name('expense');
Route::get('/journal', fn () => Inertia::render('Transaction/JournalEntryForm'))->name('journal');
Route::get('/transfer', fn () => Inertia::render('Transaction/TransferForm'))->name('transfer');
Route::get('/invoice', fn () => Inertia::render('Transaction/InvoiceForm'))->name('invoice');
Route::get('/payment', fn () => Inertia::render('Transaction/ReceivePaymentForm'))->name('payment');



});

Route::resource('chart-of-account', ChartOfAccController::class)
    ->middleware(['auth', 'verified']);

Route::resource('team', TeamController::class)
    ->middleware(['auth', 'verified']);


require __DIR__.'/auth.php';
