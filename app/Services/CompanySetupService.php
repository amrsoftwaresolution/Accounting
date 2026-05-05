<?php

namespace App\Services;

use App\Models\Company;
use App\Models\ChartOfAcc;
use App\Models\SalesSetting;
use App\Models\PaymentMethod;

class CompanySetupService
{
    public static function setup(Company $company)
    {
        // 1. Create Default Sales Settings
        SalesSetting::firstOrCreate(['company_id' => $company->id]);

        // 2. Create Default Chart of Accounts
        $accounts = [
            ['code' => '1000', 'name' => 'Cash on Hand', 'type' => 'asset', 'sub' => 'cash-and-cash-equivalents'],
            ['code' => '1010', 'name' => 'Main Bank Account', 'type' => 'asset', 'sub' => 'cash-and-cash-equivalents'],
            ['code' => '1100', 'name' => 'Accounts Receivable', 'type' => 'asset', 'sub' => 'accounts-receivable'],
            ['code' => '1200', 'name' => 'Inventory Asset', 'type' => 'asset', 'sub' => 'current-assets'],
            ['code' => '2000', 'name' => 'Accounts Payable', 'type' => 'liability', 'sub' => 'accounts-payable'],
            ['code' => '2100', 'name' => 'Credit Card', 'type' => 'liability', 'sub' => 'credit-card'],
            ['code' => '3000', 'name' => 'Opening Balance Equity', 'type' => 'equity', 'sub' => 'owners-equity'],
            ['code' => '3100', 'name' => 'Retained Earnings', 'type' => 'equity', 'sub' => 'owners-equity'],
            ['code' => '4000', 'name' => 'Sales Income', 'type' => 'income', 'sub' => 'income'],
            ['code' => '4100', 'name' => 'Service Income', 'type' => 'income', 'sub' => 'income'],
            ['code' => '5000', 'name' => 'Cost of Goods Sold', 'type' => 'expense', 'sub' => 'expense'],
            ['code' => '5100', 'name' => 'Rent Expense', 'type' => 'expense', 'sub' => 'expense'],
            ['code' => '5200', 'name' => 'Utilities Expense', 'type' => 'expense', 'sub' => 'expense'],
            ['code' => '5300', 'name' => 'Office Expense', 'type' => 'expense', 'sub' => 'expense'],
        ];

        foreach ($accounts as $acc) {
            ChartOfAcc::firstOrCreate(
                ['company_id' => $company->id, 'account_code' => $acc['code']],
                [
                    'name' => $acc['name'],
                    'account_type' => $acc['type'],
                    'sub_type' => $acc['sub'],
                    'balance' => 0,
                    'currency' => $company->home_currency ?? 'LKR'
                ]
            );
        }

        // 3. Create Default Payment Methods
        $methods = [
            ['name' => 'Cash', 'slug' => 'cash'],
            ['name' => 'Bank Transfer', 'slug' => 'bank-transfer'],
            ['name' => 'Credit Card', 'slug' => 'credit-card'],
            ['name' => 'Cheque', 'slug' => 'cheque'],
        ];
        foreach ($methods as $method) {
            PaymentMethod::firstOrCreate(
                ['company_id' => $company->id, 'slug' => $method['slug']],
                ['name' => $method['name']]
            );
        }
    }
}
