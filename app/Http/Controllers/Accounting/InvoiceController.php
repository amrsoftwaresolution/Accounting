<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\ChartOfAcc;
use App\Models\Customer;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function create()
    {
        $customers = Customer::orderBy('display_name')->get();
        $accounts = ChartOfAcc::orderBy('account_code')->get();
        
        // Get the last numeric reference for 'invoice' and increment it
        $lastRef = JournalEntry::where('transaction_type', 'invoice')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->value('reference');
            
        $nextInvoiceNo = is_numeric($lastRef) ? (int)$lastRef + 1 : 1003;
        // The user specifically mentioned 1003 if found db column+1, else 0001? 
        // Wait: "Invoice no.1003 need from db if not 0001 if found db column+1"
        // I'll use 1003 as a starting point if they want, but usually it's 1. 
        // I'll stick to 1003 as they requested it specifically.

        return Inertia::render('Transaction/InvoiceForm', [
            'customers' => $customers,
            'accounts' => $accounts,
            'nextInvoiceNo' => (string)str_pad($nextInvoiceNo, 4, '0', STR_PAD_LEFT)
        ]);
    }
}
