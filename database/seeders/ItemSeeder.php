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
                'company_name' => 'Auto Service Center',
                'company_email' => 'service@autoservice.example.com',
                'phone' => '+94 11 000 0000',
                'address' => '123 Service Road, Colombo',
                'website' => 'https://autoservice.example.com',
                'industry' => 'Automotive',
            ]);
        }

        $companyId = $company->id;

        $categories = [
            'Engine Parts',
            'Fluids & Oils',
            'Brake Systems',
            'Tires & Wheels',
            'Repair Services',
            'Diagnostic Services',
            'Labor',
            'Retail Goods',
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
            ['display_name' => 'AutoParts Global', 'company_name' => 'AutoParts Global LLC', 'email' => 'contact@autoparts.example.com'],
            ['display_name' => 'Premium Oils Co.', 'company_name' => 'Premium Oils', 'email' => 'info@premiumoils.example.com'],
            ['display_name' => 'Tire Masters', 'company_name' => 'Tire Masters Inc', 'email' => 'sales@tiremasters.example.com'],
            ['display_name' => 'Tech Diagnostics', 'company_name' => 'Tech Diagnostics Ltd.', 'email' => 'support@techdiagnostics.example.com'],
            ['display_name' => 'General Spares Ltd.', 'company_name' => 'General Spares', 'email' => 'hello@generalspares.example.com'],
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
            ['type' => 'product', 'name' => 'Synthetic Engine Oil (5W-30)', 'sku' => 'OIL-001', 'sale_price' => 45.00, 'purchase_price' => 20.00, 'track_inventory' => true, 'quantity_on_hand' => 100, 'category' => 'Fluids & Oils', 'supplier' => 1],
            ['type' => 'product', 'name' => 'Ceramic Brake Pads (Front)', 'sku' => 'BRK-001', 'sale_price' => 85.00, 'purchase_price' => 40.00, 'track_inventory' => true, 'quantity_on_hand' => 25, 'category' => 'Brake Systems', 'supplier' => 0],
            ['type' => 'product', 'name' => 'High Performance Air Filter', 'sku' => 'FLT-001', 'sale_price' => 25.00, 'purchase_price' => 12.00, 'track_inventory' => true, 'quantity_on_hand' => 40, 'category' => 'Engine Parts', 'supplier' => 4],
            ['type' => 'product', 'name' => 'Premium Oil Filter', 'sku' => 'FLT-002', 'sale_price' => 15.00, 'purchase_price' => 6.00, 'track_inventory' => true, 'quantity_on_hand' => 50, 'category' => 'Engine Parts', 'supplier' => 4],
            ['type' => 'product', 'name' => 'Iridium Spark Plugs (Set of 4)', 'sku' => 'IGN-001', 'sale_price' => 60.00, 'purchase_price' => 30.00, 'track_inventory' => true, 'quantity_on_hand' => 30, 'category' => 'Engine Parts', 'supplier' => 0],
            ['type' => 'product', 'name' => 'All-Season Tire (205/55R16)', 'sku' => 'TIR-001', 'sale_price' => 120.00, 'purchase_price' => 75.00, 'track_inventory' => true, 'quantity_on_hand' => 16, 'category' => 'Tires & Wheels', 'supplier' => 2],
            ['type' => 'product', 'name' => 'Heavy Duty Car Battery', 'sku' => 'BAT-001', 'sale_price' => 150.00, 'purchase_price' => 85.00, 'track_inventory' => true, 'quantity_on_hand' => 10, 'category' => 'Engine Parts', 'supplier' => 0],
            ['type' => 'product', 'name' => 'Engine Coolant (Pre-mixed)', 'sku' => 'CLN-001', 'sale_price' => 20.00, 'purchase_price' => 10.00, 'track_inventory' => true, 'quantity_on_hand' => 45, 'category' => 'Fluids & Oils', 'supplier' => 1],
            ['type' => 'product', 'name' => 'Silicone Wiper Blades (Pair)', 'sku' => 'WIP-001', 'sale_price' => 35.00, 'purchase_price' => 15.00, 'track_inventory' => true, 'quantity_on_hand' => 35, 'category' => 'Retail Goods', 'supplier' => 4],
            ['type' => 'service', 'name' => 'Standard Oil Change Service', 'sku' => 'SRV-OIL', 'sale_price' => 30.00, 'purchase_price' => 0.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Repair Services', 'supplier' => 4],
            ['type' => 'service', 'name' => 'Full Engine Diagnostic', 'sku' => 'SRV-DIA', 'sale_price' => 95.00, 'purchase_price' => 0.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Diagnostic Services', 'supplier' => 3],
            ['type' => 'service', 'name' => 'Computerized Wheel Alignment', 'sku' => 'SRV-ALN', 'sale_price' => 75.00, 'purchase_price' => 0.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Repair Services', 'supplier' => 2],
            ['type' => 'service', 'name' => 'Brake Pad Replacement', 'sku' => 'SRV-BRK', 'sale_price' => 50.00, 'purchase_price' => 0.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Repair Services', 'supplier' => 0],
            ['type' => 'service', 'name' => 'AC Gas Refill & Service', 'sku' => 'SRV-AC', 'sale_price' => 110.00, 'purchase_price' => 25.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Repair Services', 'supplier' => 4],
            ['type' => 'service', 'name' => 'General Comprehensive Service', 'sku' => 'SRV-GEN', 'sale_price' => 150.00, 'purchase_price' => 0.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Repair Services', 'supplier' => 4],
            ['type' => 'service', 'name' => 'Hourly Labor Rate', 'sku' => 'SRV-LBR', 'sale_price' => 80.00, 'purchase_price' => 0.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Labor', 'supplier' => 4],
            ['type' => 'service', 'name' => 'Transmission Fluid Flush', 'sku' => 'SRV-TRN', 'sale_price' => 130.00, 'purchase_price' => 45.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Repair Services', 'supplier' => 1],
            ['type' => 'product', 'name' => 'Transmission Fluid (1L)', 'sku' => 'OIL-002', 'sale_price' => 18.00, 'purchase_price' => 8.00, 'track_inventory' => true, 'quantity_on_hand' => 60, 'category' => 'Fluids & Oils', 'supplier' => 1],
            ['type' => 'product', 'name' => 'Halogen Headlight Bulb', 'sku' => 'LGT-001', 'sale_price' => 25.00, 'purchase_price' => 10.00, 'track_inventory' => true, 'quantity_on_hand' => 40, 'category' => 'Electronics', 'supplier' => 0],
            ['type' => 'service', 'name' => 'Headlight Alignment & Replacement', 'sku' => 'SRV-LGT', 'sale_price' => 35.00, 'purchase_price' => 0.00, 'track_inventory' => false, 'quantity_on_hand' => 0, 'category' => 'Repair Services', 'supplier' => 4],
        ];

        foreach ($items as $itemData) {
            $category = $categoryRecords[$itemData['category']] ?? null;

            if ($category) {
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
                        'item_category_id' => $category->id,
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
}
