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

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::create([
            'name' => 'Growdigitec',
            'email' => 'growdigitec@gmail.com',
            'password' => Hash::make('Grow2025@'),
            'role' => 'admin',
            'phone' => '+94702899880',
            'is_active' => true,
        ]);

        // 2. Create Chart of Accounts
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
        ];

        $accountModels = [];
        foreach ($accounts as $acc) {
            $accountModels[$acc['code']] = ChartOfAcc::create([
                'account_code' => $acc['code'],
                'name' => $acc['name'],
                'account_type' => $acc['type'],
                'sub_type' => $acc['sub'],
                'balance' => 0,
                'is_active' => true,
            ]);
        }

        // 3. Create Categories & Items
        $cat1 = ItemCategory::create(['name' => 'Electronics', 'description' => 'Gadgets and gear']);
        $cat2 = ItemCategory::create(['name' => 'Services', 'description' => 'Professional services']);

        Item::create([
            'name' => 'MacBook Pro M3',
            'sku' => 'MBP-M3-001',
            'type' => 'product',
            'item_category_id' => $cat1->id,
            'sale_price' => 2500,
            'purchase_price' => 2000,
            'income_account_id' => $accountModels['4000']->id,
            'expense_account_id' => $accountModels['5000']->id,
            'inventory_account_id' => $accountModels['1200']->id,
            'track_inventory' => true,
            'quantity_on_hand' => 10,
        ]);

        Item::create([
            'name' => 'Consulting Session',
            'sku' => 'SRV-CONS',
            'type' => 'service',
            'item_category_id' => $cat2->id,
            'sale_price' => 150,
            'income_account_id' => $accountModels['4100']->id,
        ]);

        // 4. Create Contacts
        Customer::create([
            'display_name' => 'John Doe',
            'email' => 'john@example.com',
            'phone_number' => '+94771234567',
        ]);

        Supplier::create([
            'display_name' => 'Global Tech Solutions',
            'email' => 'sales@globaltech.com',
            'company_name' => 'Global Tech Inc.',
        ]);

        // 5. Create some Journal Entries (History)
        // Opening balance for Bank
        $je1 = JournalEntry::create([
            'date' => now()->subDays(10)->format('Y-m-d'),
            'reference' => 'OB-001',
            'description' => 'Opening balance for Main Bank',
            'transaction_type' => 'opening_balance',
            'total_amount' => 50000,
            'status' => 'posted',
            'created_by' => $admin->id,
        ]);

        $je1->lines()->createMany([
            ['chart_of_acc_id' => $accountModels['1010']->id, 'debit' => 50000, 'credit' => 0, 'memo' => 'Opening balance'],
            ['chart_of_acc_id' => $accountModels['3000']->id, 'debit' => 0, 'credit' => 50000, 'memo' => 'Opening balance offset'],
        ]);

        // Rent payment
        $je2 = JournalEntry::create([
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

        // Update balances for display (optional as the ledger calculates it, but the index uses 'balance' field)
        $accountModels['1010']->update(['balance' => 48800]);
        $accountModels['3000']->update(['balance' => -50000]);
        $accountModels['5100']->update(['balance' => 1200]);
    }
}
