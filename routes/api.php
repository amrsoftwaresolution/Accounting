<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LookupController;
use App\Http\Controllers\Api\TransactionHistoryController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/payees', [LookupController::class, 'payees'])->name('api.payees');
    Route::get('/accounts', [LookupController::class, 'accounts'])->name('api.accounts');
    Route::get('/accounts/detail', [LookupController::class, 'accountDetails'])->name('api.accounts.detail');
    Route::get('/accounts/next-code', [LookupController::class, 'nextCode'])->name('api.accounts.next-code');
    Route::post('/accounts/save-date', [LookupController::class, 'saveOpeningBalanceDate'])->name('api.accounts.save-date');
    Route::get('/expenses/next-ref', [LookupController::class, 'nextExpenseRef'])->name('api.expenses.next-ref');
    Route::get('/items', [LookupController::class, 'items'])->name('api.items');
    Route::get('/items/create-options', [LookupController::class, 'itemCreateOptions'])->name('api.items.create-options');
    Route::get('/customers/{customer}', [LookupController::class, 'customerInfo'])->name('api.customers.info');
    Route::get('/customers/{customer}/invoices', [LookupController::class, 'customerInvoices'])->name('api.customers.invoices');
    Route::get('/suppliers/{supplier}', [LookupController::class, 'supplierInfo'])->name('api.suppliers.info');
    Route::get('/suppliers/{supplier}/bills', [LookupController::class, 'supplierBills'])->name('api.suppliers.bills');
    Route::get('/categories', [LookupController::class, 'categories'])->name('api.categories');
    Route::get('/payment-methods', [LookupController::class, 'paymentMethods'])->name('api.payment-methods');
    Route::get('/history/{transactionType}', [TransactionHistoryController::class, 'index'])->name('api.history');
});
