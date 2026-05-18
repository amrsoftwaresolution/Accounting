<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ChartOfAcc;
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
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create Default Company
        $adminCompany = Company::updateOrCreate(
            ['id' => 1],
            [
                'company_name' => 'JobAlign Books Solutions Ltd',
                'company_email' => 'hello@jobalign.example.com',
                'phone' => '+94 11 234 5678',
                'address' => '123 Business Park, Colombo 03, Sri Lanka',
                'website' => 'https://jobalign.example.com',
                'industry' => 'Financial Services',
                'home_currency' => 'LKR',
            ]
        );

        $userCompany = Company::updateOrCreate(
            ['id' => 2],
            [
                'company_name' => 'GreenMart Retail Pvt Ltd',
                'company_email' => 'support@greenmart.example.com',
                'phone' => '+94 77 456 7890',
                'address' => '45 Market Street, Kandy, Sri Lanka',
                'website' => 'https://greenmart.example.com',
                'industry' => 'Retail & Wholesale',
                'home_currency' => 'LKR',
            ]
        );

        $superAdminCompany = Company::updateOrCreate(
            ['id' => 3],
            [
                'company_name' => 'NovaCore Technologies',
                'company_email' => 'admin@novacore.example.com',
                'phone' => '+94 71 987 6543',
                'address' => '88 Tech Avenue, Colombo 05, Sri Lanka',
                'website' => 'https://novacore.example.com',
                'industry' => 'Software & IT Services',
                'home_currency' => 'USD',
            ]
        );

        // 2. Create Admin User
        $admin = User::updateOrCreate(
            ['email' => 'growdigitec@gmail.com'], // unique check
            [
                'name' => 'Growdigitec',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '+94702899880',
                'is_active' => 1,
            ]
        );

        // 2. Create User
        $user = User::updateOrCreate(
            ['email' => 'user@growdigitec.com'], // unique check
            [
                'name' => 'User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'phone' => '+94702899880',
                'is_active' => 1,
            ]
        );

        // 2. Create Super Admin User
        $super_admin = User::updateOrCreate(
            ['email' => 'superadmin@growdigitec.com'], // unique check
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'phone' => '+94702899880',
                'is_active' => 1,
            ]
        );

        // Link user to company (Fixed: mapped to defined company variables)
        $user->companies()->syncWithoutDetaching([$userCompany->id => ['role' => 'user']]);
        $super_admin->companies()->syncWithoutDetaching([$superAdminCompany->id => ['role' => 'super_admin']]);
        $admin->companies()->syncWithoutDetaching([$adminCompany->id => ['role' => 'admin']]);

        // 3. Create Chart of Accounts
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

        $accountModels = [];
        foreach ($accounts as $acc) {
            $accountModels[$acc['code']] = ChartOfAcc::updateOrCreate(
                ['company_id' => $adminCompany->id, 'account_code' => $acc['code']],
                [
                    'name' => $acc['name'],
                    'account_type' => $acc['type'],
                    'sub_type' => $acc['sub'],
                    'balance' => 0,
                ]
            );
        }

        // 4. Create Categories & Items
        $cat1 = ItemCategory::updateOrCreate(['company_id' => $adminCompany->id, 'name' => 'Electronics']);
        $cat2 = ItemCategory::updateOrCreate(['company_id' => $adminCompany->id, 'name' => 'Services']);

        Item::updateOrCreate(
            ['company_id' => $adminCompany->id, 'sku' => 'MBP-M3-001'],
            [
                'name' => 'MacBook Pro M3',
                'type' => 'product',
                'item_category_id' => $cat1->id,
                'sale_price' => 2500,
                'purchase_price' => 2000,
                'income_account_id' => $accountModels['4000']->id,
            ]
        );

        // 5. Create Contacts
        Customer::updateOrCreate(
            ['company_id' => $adminCompany->id, 'email' => 'john@example.com'],
            ['display_name' => 'John Doe']
        );

        Supplier::updateOrCreate(
            ['company_id' => $adminCompany->id, 'company_name' => 'Global Tech Inc.'],
            ['display_name' => 'Global Tech Solutions']
        );

        // 6. Create some Journal Entries
        $je1 = JournalEntry::updateOrCreate(
            ['company_id' => $adminCompany->id, 'reference' => 'OB-001'],
            [
                'date' => now()->subDays(10)->format('Y-m-d'),
                'description' => 'Opening balance',
                'transaction_type' => 'journal_entry',
                'total_amount' => 50000,
                'status' => 'posted',
                'created_by' => $admin->id,
            ]
        );

        $je1->lines()->delete();
        $je1->lines()->createMany([
            ['chart_of_acc_id' => $accountModels['1010']->id, 'debit' => 50000, 'credit' => 0],
            ['chart_of_acc_id' => $accountModels['3000']->id, 'debit' => 0, 'credit' => 50000],
        ]);

        // Rent payment
        $je2 = JournalEntry::create([
            'company_id' => $adminCompany->id, // added to prevent transaction mismatch
            'date' => now()->subDays(2)->format('Y-m-d'),
            'reference' => 'JE-2024-001',
            'description' => 'Monthly Rent Payment',
            'transaction_type' => 'journal_entry',
            'total_amount' => 1200,
            'status' => 'posted',
            'created_by' => $admin->id,
        ]);

        $je2->lines()->createMany([
            ['chart_of_acc_id' => $accountModels['5100']->id, 'debit' => 1200, 'credit' => 0, 'memo' => 'April Rent'],
            ['chart_of_acc_id' => $accountModels['1010']->id, 'debit' => 0, 'credit' => 1200, 'memo' => 'Paid via Bank'],
        ]);

        // Update balances for display
        $accountModels['1010']->update(['balance' => 48800]);
        $accountModels['3000']->update(['balance' => -50000]);
        $accountModels['5100']->update(['balance' => 1200]);

        $this->call([
            PaymentMethodSeeder::class,
            AdvancedSettingsSeeder::class,
        ]);
    }
}