<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JournalEntry;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    public function create()
    {
        $suppliers = Supplier::orderBy('display_name')->get();
        $accounts = ChartOfAcc::orderBy('account_code')->get();
        
        // Get the last numeric reference for 'bill' and increment it
        $lastRef = JournalEntry::where('transaction_type', 'bill')
            ->orderByRaw('CAST(reference AS UNSIGNED) DESC')
            ->value('reference');
            
        $nextBillNo = is_numeric($lastRef) ? (int)$lastRef + 1 : 1001;

        return Inertia::render('Transaction/BillForm', [
            'suppliers' => $suppliers,
            'accounts' => $accounts,
            'nextBillNo' => (string)str_pad($nextBillNo, 4, '0', STR_PAD_LEFT)
        ]);
    }
}
