<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Employee;

class LookupController extends Controller
{
    /**
     * Unified endpoint to fetch payees (Suppliers, Customers, Employees)
     */
    public function payees(Request $request)
    {
        $search = $request->query('search');
        $requestedType = $request->query('type');

        $query = null;

        if (!$requestedType || $requestedType === 'Supplier') {
            $suppliers = Supplier::select('id', 'display_name as label')
                ->selectRaw("'Supplier' as type")
                ->when($search, fn($q) => $q->where('display_name', 'like', "%{$search}%"));
            $query = $suppliers;
        }

        if (!$requestedType || $requestedType === 'Customer') {
            $customers = Customer::select('id', 'display_name as label')
                ->selectRaw("'Customer' as type")
                ->when($search, fn($q) => $q->where('display_name', 'like', "%{$search}%"));
            $query = $query ? $query->union($customers) : $customers;
        }

        if (!$requestedType || $requestedType === 'Employee') {
            $employees = Employee::select('id', 'name as label')
                ->selectRaw("'Employee' as type")
                ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"));
            $query = $query ? $query->union($employees) : $employees;
        }

        $payees = $query->orderBy('label')
            ->get()
            ->map(function($p) {
                return [
                    'value' => $p->id,
                    'label' => $p->label,
                    'type' => $p->type
                ];
            });

        return response()->json($payees);
    }

    /**
     * Endpoint to fetch accounts from Chart of Accounts
     */
    public function accounts(Request $request)
    {
        $search = $request->query('search');
        $type = $request->query('type'); // optional: filter by account_type

        $accounts = \App\Models\ChartOfAcc::select('id', 'name', 'account_code', 'balance', 'account_type')
            ->when($search, function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('account_code', 'like', "%{$search}%");
            })
            ->when($type, fn($q) => $q->where('account_type', $type))
            ->orderBy('account_code')
            ->get()
            ->map(function($acc) {
                return [
                    'value' => $acc->id,
                    'label' => "{$acc->account_code} - {$acc->name}",
                    'balance' => $acc->balance,
                    'account_type' => $acc->account_type
                ];
            });

        return response()->json($accounts);
    }

    /**
     * Endpoint to fetch items (Products/Services)
     */
    public function items(Request $request)
    {
        $search = $request->query('search');

        $items = \App\Models\Item::select('id', 'name', 'sale_price', 'purchase_price', 'description')
            ->when($search, function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->get()
            ->map(function($item) {
                return [
                    'value' => $item->id,
                    'label' => $item->name,
                    'rate' => $item->sale_price,
                    'purchase_price' => $item->purchase_price,
                    'description' => $item->description
                ];
            });

        return response()->json($items);
    }

    /**
     * Endpoint to fetch item categories
     */
    public function categories(Request $request)
    {
        $categories = \App\Models\ItemCategory::select('id', 'name')
            ->orderBy('name')
            ->get();
            
        return response()->json($categories);
    }

    /**
     * Endpoint to get the next account code based on selected account type
     */
    public function nextCode(Request $request)
    {
        $type = $request->query('type', 'asset');

        $defaults = [
            'asset' => 1000,
            'liability' => 2000,
            'equity' => 3000,
            'income' => 4000,
            'expense' => 5000,
        ];

        $defaultCode = $defaults[strtolower($type)] ?? 1000;

        // Fetch all account codes of this type for the active company
        $codes = \App\Models\ChartOfAcc::where('account_type', $type)
            ->pluck('account_code');

        $numericCodes = $codes->filter(function($code) {
            return is_numeric($code) && preg_match('/^\d+$/', $code);
        })->map(function($code) {
            return (int)$code;
        });

        $nextCode = $numericCodes->isEmpty() ? $defaultCode : $numericCodes->max() + 1;

        return response()->json([
            'next_code' => (string)$nextCode
        ]);
    }

    /**
     * Save the last opening balance date to the session.
     */
    public function saveOpeningBalanceDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date'
        ]);

        session(['last_opening_balance_date' => $request->input('date')]);

        return response()->json([
            'success' => true
        ]);
    }

    public function customerInfo(Customer $customer)
    {
        $customer->load('addresses');
        $billingAddress = $customer->addresses->where('type', 'billing')->first();
        
        $addressString = '';
        if ($billingAddress) {
            $parts = array_filter([
                $billingAddress->address_line_1,
                $billingAddress->address_line_2,
                $billingAddress->city,
                $billingAddress->province,
                $billingAddress->postal_code,
                $billingAddress->country
            ]);
            $addressString = implode(", ", $parts);
        }

        return response()->json([
            'email' => $customer->email,
            'billing_address' => $addressString
        ]);
    }

    public function customerInvoices(Customer $customer)
    {
        $invoices = \App\Models\Invoice::where('customer_id', $customer->id)
            ->get()
            ->map(function($invoice) {
                $allocatedAmount = \App\Models\PaymentAllocation::where('invoice_id', $invoice->id)
                    ->sum('amount');
                $openBalance = $invoice->total_amount - $allocatedAmount;
                
                return [
                    'id' => $invoice->id,
                    'invoice_no' => $invoice->invoice_no,
                    'invoice_date' => $invoice->invoice_date,
                    'due_date' => $invoice->due_date,
                    'total_amount' => $invoice->total_amount,
                    'open_balance' => $openBalance
                ];
            })
            ->filter(fn($inv) => $inv['open_balance'] > 0.01)
            ->values();

        return response()->json($invoices);
    }

    public function itemCreateOptions()
    {
        $categories = \App\Models\ItemCategory::orderBy('name')->get();
        $incomeAccounts = \App\Models\ChartOfAcc::where('account_type', 'Income')->orderBy('account_code')->get();
        $expenseAccounts = \App\Models\ChartOfAcc::where('account_type', 'Expense')->orderBy('account_code')->get();
        $inventoryAccounts = \App\Models\ChartOfAcc::where('account_type', 'asset')->orderBy('account_code')->get();
        $suppliers = \App\Models\Supplier::orderBy('display_name')->get()
            ->map(fn($s) => ['id' => $s->id, 'name' => $s->display_name]);
        $allItems = \App\Models\Item::where('type', '!=', 'bundle')->orderBy('name')->get();

        return response()->json([
            'categories' => $categories,
            'incomeAccounts' => $incomeAccounts,
            'expenseAccounts' => $expenseAccounts,
            'inventoryAccounts' => $inventoryAccounts,
            'suppliers' => $suppliers,
            'allItems' => $allItems,
        ]);
    }
}
