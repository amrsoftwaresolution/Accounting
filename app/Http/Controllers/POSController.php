<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Item;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\ChartOfAcc;

class POSController extends Controller
{
    public function index()
    {
        
        // Fetch Items (Inventory and Service)
        $items = Item::query()
            ->whereIn('type', ['inventory', 'service'])
            ->orderBy('name')
            ->get();

        // Fetch Customers
        $customers = Customer::query()
            ->orderBy('display_name')
            ->get();

        $paymentMethods = PaymentMethod::withoutGlobalScopes()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Fetch Deposit Accounts (Bank / Cash)
        $depositAccounts = ChartOfAcc::query()
            ->whereIn('account_type', ['bank', 'asset'])
            ->orderBy('name')
            ->get();

        // Default Cash account
        $defaultDepositAccount = $depositAccounts->firstWhere('name', 'Cash on Hand') 
            ?? $depositAccounts->first();

        return Inertia::render('POS/Index', [
            'items' => $items,
            'customers' => $customers,
            'paymentMethods' => $paymentMethods,
            'depositAccounts' => $depositAccounts,
            'defaultDepositAccount' => $defaultDepositAccount,
            'nextReceiptNo' => $this->getNextReceiptNo(),
        ]);
    }

    private function getNextReceiptNo()
    {
                $lastReceipt = \App\Models\SalesReceipt::whereHas('journalEntry', function($q) use ($companyId) {
            $q;
        })->latest('id')->first();
        
        $number = 1;
        if ($lastReceipt && preg_match('/\d+/', $lastReceipt->receipt_number, $matches)) {
            $number = (int)$matches[0] + 1;
        }
        return 'RCPT-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
