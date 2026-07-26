<?php

use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Garage\JobCardController;

// Accounting Controllers
use App\Http\Controllers\Accounting\ExpenseController;
use App\Http\Controllers\Accounting\PayBillController;
use App\Http\Controllers\Accounting\JournalEntryController;
use App\Http\Controllers\Accounting\TransferController;
use App\Http\Controllers\Accounting\InvoiceController;
use App\Http\Controllers\Accounting\BillController;
use App\Http\Controllers\Accounting\ReceivePaymentController;
use App\Http\Controllers\Accounting\SalesReceiptController;
use App\Http\Controllers\Accounting\BankDepositController;
use App\Http\Controllers\Accounting\CreditNoteController;
use App\Http\Controllers\Accounting\SupplierCreditController;
use App\Http\Controllers\Accounting\ChequeController;
use App\Http\Controllers\Accounting\ChartOfAccController;
use App\Http\Controllers\Accounting\ReportController;
use App\Http\Controllers\Api\TransactionHistoryController;

// Inventory Controllers
use App\Http\Controllers\Inventory\ItemController;
use App\Http\Controllers\Inventory\ItemCategoryController;
use App\Http\Controllers\Inventory\InventoryQuantityAdjustmentController;

// Contacts Controllers
use App\Http\Controllers\Contacts\CustomerController;
use App\Http\Controllers\Contacts\SupplierController;
use App\Http\Controllers\Contacts\EmployeeController;

// Settings Controllers
use App\Http\Controllers\Settings\CompanySettingsController;
use App\Http\Controllers\Settings\PrintSettingController;
use App\Http\Controllers\Garage\VehicleController;
// ...
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('welcome');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    
    // Profile
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });

    // Accounting - Expense
    Route::controller(ExpenseController::class)->prefix('expense')->group(function () {
        Route::get('/', 'create')->name('expense');
        Route::post('/', 'store')->name('expense.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('expense.edit');
        Route::patch('/{journalEntry}', 'update')->name('expense.update');
        Route::delete('/{journalEntry}', 'destroy')->name('expense.destroy');
    });

    // Accounting - Pay Bill
    Route::controller(PayBillController::class)->prefix('pay-bill')->group(function () {
        Route::get('/', 'create')->name('pay-bill');
        Route::post('/', 'store')->name('pay-bill.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('pay-bill.edit');
        Route::get('/{journalEntry}/print', 'print')->name('pay-bill.print');
        Route::patch('/{journalEntry}', 'update')->name('pay-bill.update');
        Route::delete('/{journalEntry}', 'destroy')->name('pay-bill.destroy');
    });
    
    // Accounting - Journal Entries
    Route::controller(JournalEntryController::class)->group(function () {
        Route::get('/journal', 'create')->name('journal');
        Route::post('/journal-entries/{journalEntry}/quick-update', 'quickUpdate')->name('journal-entries.quick-update');
    });
    Route::resource('journal-entries', JournalEntryController::class);

    // Accounting - Transfer
    Route::controller(TransferController::class)->prefix('transfer')->group(function () {
        Route::get('/', 'create')->name('transfer');
        Route::post('/', 'store')->name('transfer.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('transfer.edit');
        Route::patch('/{journalEntry}', 'update')->name('transfer.update');
        Route::delete('/{journalEntry}', 'destroy')->name('transfer.destroy');
    });

    // Accounting - Invoice
    Route::controller(InvoiceController::class)->prefix('invoice')->group(function () {
        Route::get('/', 'create')->name('invoice');
        Route::post('/', 'store')->name('invoice.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('invoice.edit');
        Route::get('/{journalEntry}/print', 'print')->name('invoice.print');
        Route::patch('/{journalEntry}', 'update')->name('invoice.update');
        Route::delete('/{journalEntry}', 'destroy')->name('invoice.destroy');
    });

    // Accounting - Bill
    Route::controller(BillController::class)->prefix('bill')->group(function () {
        Route::get('/', 'create')->name('bill');
        Route::post('/', 'store')->name('bill.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('bill.edit');
        Route::get('/{journalEntry}/print', 'print')->name('bill.print');
        Route::patch('/{journalEntry}', 'update')->name('bill.update');
        Route::delete('/{journalEntry}', 'destroy')->name('bill.destroy');
    });

    // Accounting - Receive Payment
    Route::controller(ReceivePaymentController::class)->prefix('payment')->group(function () {
        Route::get('/', 'create')->name('payment');
        Route::post('/', 'store')->name('payment.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('payment.edit');
        Route::get('/{journalEntry}/print', 'print')->name('payment.print');
        Route::patch('/{journalEntry}', 'update')->name('payment.update');
        Route::delete('/{journalEntry}', 'destroy')->name('payment.destroy');
    });

    // Accounting - Sales Receipt
    Route::controller(SalesReceiptController::class)->prefix('sales-receipt')->group(function () {
        Route::get('/', 'create')->name('receipt');
        Route::post('/', 'store')->name('receipt.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('receipt.edit');
        Route::patch('/{journalEntry}', 'update')->name('receipt.update');
        Route::delete('/{journalEntry}', 'destroy')->name('receipt.destroy');
    });

    // Accounting - Bank Deposit
    Route::controller(BankDepositController::class)->prefix('deposit')->group(function () {
        Route::get('/', 'create')->name('deposit');
        Route::post('/', 'store')->name('deposit.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('deposit.edit');
        Route::patch('/{journalEntry}', 'update')->name('deposit.update');
        Route::delete('/{journalEntry}', 'destroy')->name('deposit.destroy');
    });

    // Accounting - Credit Note (Sales Return)
    Route::controller(CreditNoteController::class)->prefix('sales-return')->group(function () {
        Route::get('/', 'create')->name('credit-note');
        Route::post('/', 'store')->name('credit-note.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('credit-note.edit');
        Route::get('/{journalEntry}/print', 'print')->name('credit-note.print');
        Route::patch('/{journalEntry}', 'update')->name('credit-note.update');
        Route::delete('/{journalEntry}', 'destroy')->name('credit-note.destroy');
    });

    // Accounting - Supplier Credit (Supplier Return)
    Route::controller(SupplierCreditController::class)->prefix('supplier-return')->group(function () {
        Route::get('/', 'create')->name('supplier-credit');
        Route::post('/', 'store')->name('supplier-credit.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('supplier-credit.edit');
        Route::get('/{journalEntry}/print', 'print')->name('supplier-credit.print');
        Route::patch('/{journalEntry}', 'update')->name('supplier-credit.update');
        Route::delete('/{journalEntry}', 'destroy')->name('supplier-credit.destroy');
    });

    // Accounting - Cheque
    Route::controller(ChequeController::class)->prefix('cheque')->group(function () {
        Route::get('/list', 'index')->name('cheque.index');
        Route::get('/', 'create')->name('cheque');
        Route::post('/', 'store')->name('cheque.store');
        Route::get('/{journalEntry}/edit', 'edit')->name('cheque.edit');
        Route::patch('/{journalEntry}', 'update')->name('cheque.update');
        Route::delete('/{journalEntry}', 'destroy')->name('cheque.destroy');
    });

    // Accounting - Chart of Accounts
    Route::get('chart-of-account/{chart_of_account}/history', [ChartOfAccController::class, 'history'])->name('chart-of-account.history');
    Route::resource('chart-of-account', ChartOfAccController::class);

    // Reports
    Route::controller(ReportController::class)->prefix('reports')->group(function () {
        Route::get('/', 'index')->name('reports.index');
        Route::get('/profit-loss', 'profitAndLoss')->name('reports.profit-loss');
        Route::get('/balance-sheet', 'balanceSheet')->name('reports.balance-sheet');
        Route::get('/customer-balance', 'customerBalance')->name('reports.customer-balance');
        Route::get('/customer-balance-detail', 'customerBalanceDetailAll')->name('reports.customer-balance-detail');
        Route::get('/customer-balance/{customer}', 'customerDetail')->name('reports.customer-detail');
        Route::get('/supplier-balance', 'supplierBalance')->name('reports.supplier-balance');
        Route::get('/supplier-balance-detail', 'supplierBalanceDetailAll')->name('reports.supplier-balance-detail');
        Route::get('/supplier-balance/{supplier}', 'supplierDetail')->name('reports.supplier-detail');
        Route::get('/inventory-summary', 'inventorySummary')->name('reports.inventory-summary');
        Route::get('/inventory-detail-all', 'inventoryDetailAll')->name('reports.inventory-detail-all');
        Route::get('/inventory-detail/{item}', 'inventoryDetail')->name('reports.inventory-detail');
        Route::get('/sales-by-item', 'salesByItem')->name('reports.sales-by-item');
        Route::get('/sales-by-customer', 'salesByCustomer')->name('reports.sales-by-customer');
        Route::get('/purchase-by-item', 'purchaseByItem')->name('reports.purchase-by-item');
        Route::get('/purchase-by-supplier', 'purchaseBySupplier')->name('reports.purchase-by-supplier');
    });

    // Inventory
    Route::resource('items', ItemController::class);
    Route::resource('item-categories', ItemCategoryController::class);
    Route::controller(InventoryQuantityAdjustmentController::class)->prefix('inventory-adjustment')->group(function () {
        Route::get('/', 'create')->name('inventory-adjustment');
        Route::post('/', 'store')->name('inventory-adjustment.store');
    });

    // Contacts
    Route::resource('customers', CustomerController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::resource('employees', EmployeeController::class);
    Route::resource('job-cards', JobCardController::class);
    Route::resource('vehicles', VehicleController::class);

    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [CompanySettingsController::class, 'index'])->name('settings.index');
        
        Route::controller(CompanySettingsController::class)->group(function () {
            Route::post('/company', 'update')->name('company.update');
            Route::post('/legal', 'updateLegal')->name('legal.update');
            Route::post('/accounting', 'updateAccounting')->name('accounting.update');
            Route::post('/alerts', 'updateAlerts')->name('alerts.update');
            Route::post('/time', 'updateTime')->name('time.settings.update');
            Route::post('/logo', 'uploadLogo')->name('logo.upload');
        });
    });


    // Users
    Route::resource('users', UserController::class);
    Route::post('/users/{user}/resend-invite', [UserController::class, 'resendInvitation'])->name('users.resend-invite');

    // POS
    Route::get('/pos', [POSController::class, 'index'])->name('pos.index');
    
    // History
    Route::get('/history/{transactionType}', [TransactionHistoryController::class, 'page'])->name('history.index');
});

require __DIR__.'/auth.php';
