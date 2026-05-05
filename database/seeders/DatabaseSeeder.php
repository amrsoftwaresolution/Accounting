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
        $company = Company::updateOrCreate(
            ['id' => 1],
            [
                'company_name' => 'Fingrow Solutions Ltd',
                'company_email' => 'hello@fingrow.example.com',
                'phone' => '+94 11 234 5678',
                'address' => '123 Business Park, Colombo 03, Sri Lanka',
                'website' => 'https://fingrow.example.com',
                'industry' => 'Financial Services',
                'home_currency' => 'LKR',
            ]
        );

        // 2. Create Admin User
        $admin = User::updateOrCreate(
            ['email' => 'growdigitec@gmail.com'],
            [
                'name' => 'Growdigitec',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '+94702899880',
                'is_active' => 1,
            ]
        );

        // Link user to company
        $admin->companies()->syncWithoutDetaching([$company->id => ['role' => 'admin']]);

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
                ['company_id' => $company->id, 'account_code' => $acc['code']],
                [
                    'name' => $acc['name'],
                    'account_type' => $acc['type'],
                    'sub_type' => $acc['sub'],
                    'balance' => 0,
                ]
            );
        }

        // 4. Create Categories & Items
        $cat1 = ItemCategory::updateOrCreate(['company_id' => $company->id, 'name' => 'Electronics']);
        $cat2 = ItemCategory::updateOrCreate(['company_id' => $company->id, 'name' => 'Services']);

        Item::updateOrCreate(
            ['company_id' => $company->id, 'sku' => 'MBP-M3-001'],
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
            ['company_id' => $company->id, 'email' => 'john@example.com'],
            ['display_name' => 'John Doe']
        );

        Supplier::updateOrCreate(
            ['company_id' => $company->id, 'company_name' => 'Global Tech Inc.'],
            ['display_name' => 'Global Tech Solutions']
        );

        // 6. Create some Journal Entries
        $je1 = JournalEntry::updateOrCreate(
            ['company_id' => $company->id, 'reference' => 'OB-001'],
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

        $this->call([
            PaymentMethodSeeder::class,
        ]);
    }
}
