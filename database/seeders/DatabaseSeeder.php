<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ChartOfAcc;
use App\Models\Package;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Company;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('companies')->truncate();
        DB::table('company_user')->truncate();
        DB::table('chart_of_accs')->truncate();
        DB::table('item_categories')->truncate();
        DB::table('items')->truncate();
        DB::table('customers')->truncate();
        DB::table('suppliers')->truncate();
        DB::table('journal_entries')->truncate();
        DB::table('journal_entry_lines')->truncate();
        DB::table('users')->truncate();
        DB::table('packages')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create 4 packages dummy data
        $packages = [
            [
                'id' => 1,
                'name' => 'Basic Plan',
                'description' => 'Great for small startups and freelancers.',
                'price' => 10.00,
                'billing_period' => 'monthly',
                'max_companies' => 1,
                'max_chart_of_accounts' => 50,
                'max_products' => 20,
                'max_users' => 2,
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Standard Plan',
                'description' => 'Ideal for growing businesses needing more capacity.',
                'price' => 29.00,
                'billing_period' => 'monthly',
                'max_companies' => 3,
                'max_chart_of_accounts' => 150,
                'max_products' => 100,
                'max_users' => 5,
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Professional Plan',
                'description' => 'Advanced features and limits for established teams.',
                'price' => 79.00,
                'billing_period' => 'monthly',
                'max_companies' => 10,
                'max_chart_of_accounts' => 500,
                'max_products' => 1000,
                'max_users' => 15,
                'is_active' => true,
            ],
            [
                'id' => 4,
                'name' => 'Enterprise Plan',
                'description' => 'Unlimited scaling and priority support for large corporations.',
                'price' => 199.00,
                'billing_period' => 'yearly',
                'max_companies' => 100,
                'max_chart_of_accounts' => 5000,
                'max_products' => 10000,
                'max_users' => 100,
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            Package::updateOrCreate(
                ['id' => $pkg['id']],
                $pkg
            );
        }

        // Seed Currencies
        $lkr = \App\Models\Currency::updateOrCreate(
            ['code' => 'LKR'],
            ['name' => 'Sri Lankan Rupee', 'symbol' => 'Rs.', 'exchange_rate' => 1.0, 'is_base_currency' => true]
        );
        $usd = \App\Models\Currency::updateOrCreate(
            ['code' => 'USD'],
            ['name' => 'US Dollar', 'symbol' => '$', 'exchange_rate' => 300.0, 'is_base_currency' => false]
        );
        $eur = \App\Models\Currency::updateOrCreate(
            ['code' => 'EUR'],
            ['name' => 'Euro', 'symbol' => '€', 'exchange_rate' => 320.0, 'is_base_currency' => false]
        );

        // 2. Create only one company dummy data
        $testCompany = Company::updateOrCreate(
            ['id' => 1],
            [
                'company_name' => 'Test Company',
                'company_email' => 'hello@testcompany.example.com',
                'phone' => '+94 11 234 5678',
                'address' => '123 Business Road, Colombo, Sri Lanka',
                'website' => 'https://testcompany.example.com',
                'industry' => 'Financial Services',
                'currency_id' => $lkr->id,
                'package_id' => 2, // Assign Standard Plan
            ]
        );

        // 3. Create Users
        $ilhamsadath = User::updateOrCreate(
            ['email' => 'ilhamsadath29@gmail.com'],
            [
                'name' => 'Ilham Sadath',
                'password' => Hash::make('RoshanAara10'),
                'role' => 'admin',
                'is_active' => 1,
            ]
        );

        $caderammar = User::updateOrCreate(
            ['email' => 'ammargrowdigitec@gmail.com'],
            [
                'name' => 'Ammar',
                'password' => Hash::make('ammar123'),
                'role' => 'admin',
                'is_active' => 1,
            ]
        );

        $amrasacc = User::updateOrCreate(
            ['email' => 'amrasacc@gmail.com'],
            [
                'name' => 'Rasly',
                'password' => Hash::make('123manager'),
                'role' => 'admin',
                'is_active' => 1,
            ]
        );

        $staff02 = User::updateOrCreate(
            ['email' => 'growdigitec.staff02@gmail.com'],
            [
                'name' => 'Jafees',
                'password' => Hash::make('staff02@'),
                'role' => 'user',
                'is_active' => 1,
            ]
        );

        $staff01 = User::updateOrCreate(
            ['email' => 'growdigitec.staff01@gmail.com'],
            [
                'name' => 'Rusthi',
                'password' => Hash::make('staff01@'),
                'role' => 'user',
                'is_active' => 1,
            ]
        );

        // Create Super Admin User for system administration
        $super_admin = User::updateOrCreate(
            ['email' => 'superadmin@growdigitec.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'is_active' => 1,
            ]
        );

        // Link users to company
        $ilhamsadath->companies()->syncWithoutDetaching([$testCompany->id => ['role' => 'admin']]);
        $caderammar->companies()->syncWithoutDetaching([$testCompany->id => ['role' => 'admin']]);
        $amrasacc->companies()->syncWithoutDetaching([$testCompany->id => ['role' => 'admin']]);
        $staff02->companies()->syncWithoutDetaching([$testCompany->id => ['role' => 'user']]);
        $staff01->companies()->syncWithoutDetaching([$testCompany->id => ['role' => 'user']]);

        // 4. Create Chart of Accounts for the single company
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
            ChartOfAcc::updateOrCreate(
                ['company_id' => $testCompany->id, 'account_code' => $acc['code']],
                [
                    'name' => $acc['name'],
                    'account_type' => $acc['type'],
                    'sub_type' => $acc['sub'],
                    'balance' => 0,
                ]
            );
        }

        // Run other seeders
        $this->call([
            PaymentMethodSeeder::class,
            AdvancedSettingsSeeder::class,
            CurrencyMetadataSeeder::class,
            ItemSeeder::class,
        ]);
    }
}