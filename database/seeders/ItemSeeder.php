<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\ChartOfAcc;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();
        if (! $company) {
            $company = Company::create([
                'company_name' => 'Dummy Company',
                'company_email' => 'dummy@example.com',
                'phone' => '+94 11 000 0000',
                'address' => '123 Demo Road, Colombo',
                'website' => 'https://example.com',
                'industry' => 'General',
                'currency_id' => 1,
                'package_id' => 1,
            ]);
        }

        $companyId = $company->id;

        $categories = [
            'Office Furniture',
            'Software Services',
            'Consulting',
            'Retail Goods',
            'Maintenance',
            'Marketing',
            'Electronics',
        ];

        $categoryRecords = collect($categories)->mapWithKeys(function ($name) use ($companyId) {
            $category = ItemCategory::updateOrCreate(
                ['company_id' => $companyId, 'name' => $name],
                ['company_id' => $companyId, 'name' => $name]
            );

            return [$name => $category];
        });

        $suppliers = [
            ['display_name' => 'Global Supplies LLC', 'company_name' => 'Global Supplies', 'email' => 'contact@globalsupplies.example.com'],
            ['display_name' => 'Premium Services Co.', 'company_name' => 'Premium Services', 'email' => 'info@premiumservices.example.com'],
            ['display_name' => 'Office Essentials', 'company_name' => 'Office Essentials', 'email' => 'sales@officeessentials.example.com'],
            ['display_name' => 'Tech Hardware Ltd.', 'company_name' => 'Tech Hardware', 'email' => 'support@techhardware.example.com'],
            ['display_name' => 'Creative Marketing', 'company_name' => 'Creative Marketing', 'email' => 'hello@creativemarketing.example.com'],
        ];

        $supplierRecords = collect($suppliers)->map(function ($supplierData) use ($companyId) {
            return Supplier::updateOrCreate(
                ['company_id' => $companyId, 'display_name' => $supplierData['display_name']],
                [
                    'company_id' => $companyId,
                    'display_name' => $supplierData['display_name'],
                    'company_name' => $supplierData['company_name'],
                    'email' => $supplierData['email'],
                    'first_name' => explode(' ', $supplierData['display_name'])[0],
                    'last_name' => explode(' ', $supplierData['display_name'])[1] ?? null,
                ]
            );
        });

        $incomeAccounts = ChartOfAcc::where('company_id', $companyId)
            ->where('account_type', 'income')
            ->pluck('id')
            ->toArray();

        $expenseAccounts = ChartOfAcc::where('company_id', $companyId)
            ->where('account_type', 'expense')
            ->pluck('id')
            ->toArray();

        $inventoryAccount = ChartOfAcc::where('company_id', $companyId)
            ->where('account_type', 'asset')
            ->where(function ($query) {
                $query->where('sub_type', 'current-assets')
                      ->orWhere('sub_type', 'inventory');
            })
            ->first();

        if (! $inventoryAccount) {
            $inventoryAccount = ChartOfAcc::create([
                'company_id' => $companyId,
                'account_code' => '1300',
                'name' => 'Inventory Asset',
                'account_type' => 'asset',
                'sub_type' => 'inventory',
                'balance' => 0,
            ]);
        }

        $incomeAccountId = $incomeAccounts[0] ?? $inventoryAccount->id;
        $expenseAccountId = $expenseAccounts[0] ?? $inventoryAccount->id;

        $items = [
            ['type' => 'product', 'name' => 'Executive Desk Chair', 'sku' => 'PRD-001', 'sale_price' => 149.99, 'purchase_price' => 85.00, 'track_inventory' => true, 'quantity_on_hand' => 18, 'category' => 'Office Furniture', 'supplier' => 0],
            ['type' => 'service', 'name' => 'Cloud Backup Subscription', 'sku' => 'SRV-001', 'sale_price' => 99.00, 'purchase_price' => 20.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Software Services', 'supplier' => 1],
            ['type' => 'service', 'name' => 'Business Consulting Session', 'sku' => 'SRV-002', 'sale_price' => 250.00, 'purchase_price' => 65.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Consulting', 'supplier' => 1],
            ['type' => 'product', 'name' => 'Wireless Keyboard', 'sku' => 'PRD-002', 'sale_price' => 45.50, 'purchase_price' => 22.75, 'track_inventory' => true, 'quantity_on_hand' => 32, 'category' => 'Electronics', 'supplier' => 3],
            ['type' => 'product', 'name' => 'Branded Notebooks Pack', 'sku' => 'PRD-003', 'sale_price' => 23.99, 'purchase_price' => 12.00, 'track_inventory' => true, 'quantity_on_hand' => 80, 'category' => 'Office Furniture', 'supplier' => 2],
            ['type' => 'service', 'name' => 'Graphic Design Retainer', 'sku' => 'SRV-003', 'sale_price' => 320.00, 'purchase_price' => 90.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Marketing', 'supplier' => 4],
            ['type' => 'product', 'name' => 'USB-C Docking Station', 'sku' => 'PRD-004', 'sale_price' => 79.99, 'purchase_price' => 45.00, 'track_inventory' => true, 'quantity_on_hand' => 24, 'category' => 'Electronics', 'supplier' => 3],
            ['type' => 'product', 'name' => 'Conference Room Whiteboard', 'sku' => 'PRD-005', 'sale_price' => 120.00, 'purchase_price' => 58.00, 'track_inventory' => true, 'quantity_on_hand' => 12, 'category' => 'Office Furniture', 'supplier' => 0],
            ['type' => 'service', 'name' => 'Monthly IT Support Plan', 'sku' => 'SRV-004', 'sale_price' => 180.00, 'purchase_price' => 40.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Software Services', 'supplier' => 3],
            ['type' => 'product', 'name' => 'Ergonomic Mouse', 'sku' => 'PRD-006', 'sale_price' => 29.99, 'purchase_price' => 14.50, 'track_inventory' => true, 'quantity_on_hand' => 60, 'category' => 'Electronics', 'supplier' => 3],
            ['type' => 'service', 'name' => 'Email Marketing Campaign', 'sku' => 'SRV-005', 'sale_price' => 220.00, 'purchase_price' => 55.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Marketing', 'supplier' => 4],
            ['type' => 'product', 'name' => 'Laptop Stand', 'sku' => 'PRD-007', 'sale_price' => 34.99, 'purchase_price' => 16.00, 'track_inventory' => true, 'quantity_on_hand' => 44, 'category' => 'Office Furniture', 'supplier' => 2],
            ['type' => 'product', 'name' => 'Noise Cancelling Headphones', 'sku' => 'PRD-008', 'sale_price' => 129.00, 'purchase_price' => 70.00, 'track_inventory' => true, 'quantity_on_hand' => 20, 'category' => 'Electronics', 'supplier' => 3],
            ['type' => 'service', 'name' => 'Annual Financial Review', 'sku' => 'SRV-006', 'sale_price' => 420.00, 'purchase_price' => 100.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Consulting', 'supplier' => 1],
            ['type' => 'product', 'name' => 'Desk Organizer Set', 'sku' => 'PRD-009', 'sale_price' => 18.50, 'purchase_price' => 9.00, 'track_inventory' => true, 'quantity_on_hand' => 90, 'category' => 'Office Furniture', 'supplier' => 2],
            ['type' => 'service', 'name' => 'Payroll Processing', 'sku' => 'SRV-007', 'sale_price' => 150.00, 'purchase_price' => 35.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Consulting', 'supplier' => 1],
            ['type' => 'product', 'name' => 'Mobile Power Bank', 'sku' => 'PRD-010', 'sale_price' => 39.99, 'purchase_price' => 20.00, 'track_inventory' => true, 'quantity_on_hand' => 50, 'category' => 'Electronics', 'supplier' => 3],
            ['type' => 'product', 'name' => 'Presentation Projector', 'sku' => 'PRD-011', 'sale_price' => 399.99, 'purchase_price' => 225.00, 'track_inventory' => true, 'quantity_on_hand' => 8, 'category' => 'Electronics', 'supplier' => 3],
            ['type' => 'service', 'name' => 'Web Design Package', 'sku' => 'SRV-008', 'sale_price' => 600.00, 'purchase_price' => 185.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Marketing', 'supplier' => 4],
            ['type' => 'product', 'name' => 'Protective Laptop Sleeve', 'sku' => 'PRD-012', 'sale_price' => 24.99, 'purchase_price' => 11.50, 'track_inventory' => true, 'quantity_on_hand' => 65, 'category' => 'Retail Goods', 'supplier' => 2],
        ];

        foreach ($items as $itemData) {
            Item::updateOrCreate(
                ['company_id' => $companyId, 'sku' => $itemData['sku']],
                [
                    'company_id' => $companyId,
                    'type' => $itemData['type'],
                    'name' => $itemData['name'],
                    'sku' => $itemData['sku'],
                    'image' => null,
                    'description' => "Sample entry for {$itemData['name']}",
                    'sale_price' => $itemData['sale_price'],
                    'income_account_id' => $incomeAccountId,
                    'purchase_price' => $itemData['purchase_price'],
                    'expense_account_id' => $expenseAccountId,
                    'track_inventory' => $itemData['track_inventory'],
                    'quantity_on_hand' => $itemData['quantity_on_hand'],
                    'inventory_account_id' => $itemData['track_inventory'] ? $inventoryAccount->id : null,
                    'item_category_id' => $categoryRecords[$itemData['category']]->id,
                    'as_of_date' => Carbon::now()->subDays(rand(1, 30))->format('Y-m-d'),
                    'reorder_point' => $itemData['track_inventory'] ? rand(5, 20) : 0,
                    'purchase_description' => "Procured from {$supplierRecords[$itemData['supplier']]->display_name}",
                    'preferred_supplier_id' => $supplierRecords[$itemData['supplier']]->id,
                    'is_sold' => true,
                    'is_purchased' => true,
                ]
            );
        }
    }
}
