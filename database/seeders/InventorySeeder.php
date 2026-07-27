<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ItemCategory;
use App\Models\Item;
use App\Models\BundleItem;
use Illuminate\Support\Facades\DB;
use App\Models\ChartOfAcc;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        BundleItem::truncate();
        Item::truncate();
        ItemCategory::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $salesAcc = ChartOfAcc::where('name', 'Sales')->first()->id ?? ChartOfAcc::first()->id;
        $cogsAcc = ChartOfAcc::where('name', 'Cost of Goods Sold')->first()->id ?? ChartOfAcc::first()->id;
        $invAcc = ChartOfAcc::where('name', 'Inventory Asset')->first()->id ?? ChartOfAcc::first()->id;

        $categories = [
            'Engine Services', 'Brake Services', 'Wheel Services', 'Air Conditioning', 
            'Battery Services', 'Cleaning & Detailing', 'Suspension', 'Transmission',
            'Engine Parts', 'Ignition Parts', 'Brake Parts', 'Battery', 'Exterior Parts', 'Fluids',
            'Workshop Charges', 'Transportation', 'Miscellaneous', 'Accessories', 'Workshop Supplies',
            'Service Packages'
        ];

        $catMap = [];
        foreach ($categories as $cat) {
            $catMap[$cat] = ItemCategory::create(['name' => $cat])->id;
        }

        $items = [];

        $services = [
            ['Engine Services', 'Engine Oil Change', 'SRV-ENG-001', 6500.00, 'Complete engine oil replacement with basic inspection.'],
            ['Engine Services', 'Full Vehicle Service', 'SRV-ENG-002', 18500.00, 'Complete periodic vehicle service including inspection.'],
            ['Engine Services', 'Engine Diagnostic Scan', 'SRV-ENG-003', 4500.00, 'Computerized engine fault diagnosis.'],
            ['Brake Services', 'Brake Inspection', 'SRV-BRK-001', 3000.00, 'Inspection of brake pads, discs and brake fluid.'],
            ['Brake Services', 'Brake Pad Replacement (Labor)', 'SRV-BRK-002', 5500.00, 'Labor charge for replacing brake pads.'],
            ['Wheel Services', 'Wheel Alignment', 'SRV-WHL-001', 4000.00, 'Four-wheel alignment service.'],
            ['Wheel Services', 'Wheel Balancing', 'SRV-WHL-002', 2500.00, 'Wheel balancing for smoother driving.'],
            ['Air Conditioning', 'Air Conditioner Service', 'SRV-AC-001', 8000.00, 'AC cleaning, gas pressure check and performance test.'],
            ['Battery Services', 'Battery Replacement (Labor)', 'SRV-BAT-001', 2000.00, 'Labor charge for replacing vehicle battery.'],
            ['Cleaning & Detailing', 'Car Wash & Detailing', 'SRV-CLN-001', 6000.00, 'Exterior wash and interior detailing service.'],
            ['Suspension', 'Suspension Inspection', 'SRV-SUS-001', 3500.00, 'Inspection of suspension and steering components.'],
            ['Transmission', 'Transmission Service', 'SRV-TRN-001', 12000.00, 'Transmission fluid replacement and system inspection.']
        ];

        foreach ($services as $srv) {
            $items[$srv[1]] = Item::create([
                'type' => 'service',
                'name' => $srv[1],
                'sku' => $srv[2],
                'sale_price' => $srv[3],
                'description' => $srv[4],
                'item_category_id' => $catMap[$srv[0]],
                'income_account_id' => $salesAcc,
                'is_sold' => true,
                'is_purchased' => false,
            ]);
        }

        $parts = [
            ['Engine Parts', 'Engine Oil 5W-30 (1L)', 'PRT-ENG-001', 3300.00, 4200.00, 'Premium synthetic engine oil for petrol and diesel vehicles.'],
            ['Engine Parts', 'Oil Filter', 'PRT-ENG-002', 1600.00, 2200.00, 'Genuine replacement oil filter.'],
            ['Engine Parts', 'Air Filter', 'PRT-ENG-003', 2700.00, 3500.00, 'High-quality engine air filter.'],
            ['Engine Parts', 'Cabin Filter', 'PRT-ENG-004', 2300.00, 3000.00, 'Cabin air filter for clean interior airflow.'],
            ['Ignition Parts', 'Spark Plug', 'PRT-IGN-001', 1500.00, 2000.00, 'High-performance spark plug.'],
            ['Brake Parts', 'Brake Pads Set', 'PRT-BRK-001', 9800.00, 12500.00, 'Front brake pad set for reliable braking.'],
            ['Battery', 'Car Battery 55Ah', 'PRT-BAT-001', 35500.00, 42000.00, 'Maintenance-free 55Ah automotive battery.'],
            ['Exterior Parts', 'Windshield Wiper Set', 'PRT-EXT-001', 4200.00, 5500.00, 'Durable windshield wiper blade set.'],
            ['Fluids', 'Coolant 1L', 'PRT-FLD-001', 2100.00, 2800.00, 'Long-life engine coolant.'],
            ['Fluids', 'Brake Fluid', 'PRT-FLD-002', 1500.00, 2000.00, 'DOT 4 brake fluid for hydraulic brake systems.']
        ];

        foreach ($parts as $prt) {
            $items[$prt[1]] = Item::create([
                'type' => 'inventory',
                'name' => $prt[1],
                'sku' => $prt[2],
                'purchase_price' => $prt[3],
                'sale_price' => $prt[4],
                'description' => $prt[5],
                'purchase_description' => $prt[5],
                'item_category_id' => $catMap[$prt[0]],
                'income_account_id' => $salesAcc,
                'expense_account_id' => $cogsAcc,
                'inventory_account_id' => $invAcc,
                'track_inventory' => true,
                'quantity_on_hand' => 50,
                'is_sold' => true,
                'is_purchased' => true,
            ]);
        }

        $charges = [
            ['Workshop Charges', 'Environmental Disposal Fee', 'CHG-WRK-001', 500.00, 'Disposal fee for used oil and waste materials.'],
            ['Workshop Charges', 'Shop Supplies', 'CHG-WRK-002', 1000.00, 'Consumable workshop materials used during service.'],
            ['Transportation', 'Vehicle Pickup & Delivery', 'CHG-TRN-001', 2500.00, 'Pickup and delivery service for customer vehicles.'],
            ['Transportation', 'Towing Charge', 'CHG-TRN-002', 7500.00, 'Vehicle towing service within city limits.'],
            ['Transportation', 'Fuel Surcharge', 'CHG-TRN-003', 1500.00, 'Additional transportation fuel charge.'],
            ['Miscellaneous', 'Miscellaneous Parts', 'CHG-MIS-001', 3000.00, 'Small replacement parts used during repairs.'],
            ['Accessories', 'Car Perfume', 'CHG-ACC-001', 1200.00, 'Premium vehicle air freshener.'],
            ['Workshop Supplies', 'Cleaning Chemicals', 'CHG-WRK-003', 2000.00, 'Professional vehicle cleaning chemicals.'],
            ['Workshop Supplies', 'Plastic Clips & Fasteners', 'CHG-WRK-004', 500.00, 'Plastic clips and fasteners for vehicle panels.'],
            ['Workshop Charges', 'Workshop Consumables', 'CHG-WRK-005', 1500.00, 'General workshop consumables used during repairs.']
        ];

        foreach ($charges as $chg) {
            $items[$chg[1]] = Item::create([
                'type' => 'non-inventory',
                'name' => $chg[1],
                'sku' => $chg[2],
                'sale_price' => $chg[3],
                'description' => $chg[4],
                'item_category_id' => $catMap[$chg[0]],
                'income_account_id' => $salesAcc,
                'expense_account_id' => $cogsAcc,
                'is_sold' => true,
                'is_purchased' => false,
            ]);
        }

        $bundles = [
            ['Service Packages', 'Basic Service Package', 'PKG-SRV-001', 14500.00, 'Engine oil change, oil filter replacement, brake inspection and car wash.', [
                ['Engine Oil Change', 1],
                ['Oil Filter', 1],
                ['Engine Oil 5W-30 (1L)', 4],
                ['Brake Inspection', 1],
                ['Car Wash & Detailing', 1]
            ]],
            ['Service Packages', 'Premium Service Package', 'PKG-SRV-002', 34500.00, 'Full vehicle service including filters, wheel alignment and detailing.', [
                ['Full Vehicle Service', 1],
                ['Oil Filter', 1],
                ['Engine Oil 5W-30 (1L)', 4],
                ['Air Filter', 1],
                ['Cabin Filter', 1],
                ['Wheel Alignment', 1],
                ['Car Wash & Detailing', 1]
            ]],
            ['Service Packages', 'AC Service Package', 'PKG-AC-001', 13500.00, 'Complete air conditioning service with cabin filter replacement.', [
                ['Air Conditioner Service', 1],
                ['Cabin Filter', 1]
            ]],
            ['Service Packages', 'Brake Service Package', 'PKG-BRK-001', 21500.00, 'Brake pad replacement, brake fluid replacement and brake inspection.', [
                ['Brake Pad Replacement (Labor)', 1],
                ['Brake Pads Set', 1],
                ['Brake Fluid', 1],
                ['Brake Inspection', 1]
            ]]
        ];

        foreach ($bundles as $bnd) {
            $bundle = Item::create([
                'type' => 'bundle',
                'name' => $bnd[1],
                'sku' => $bnd[2],
                'sale_price' => $bnd[3],
                'description' => $bnd[4],
                'item_category_id' => $catMap[$bnd[0]],
                'income_account_id' => $salesAcc,
                'is_sold' => true,
                'is_purchased' => false,
            ]);

            foreach ($bnd[5] as $comp) {
                if (isset($items[$comp[0]])) {
                    BundleItem::create([
                        'bundle_id' => $bundle->id,
                        'item_id' => $items[$comp[0]]->id,
                        'quantity' => $comp[1]
                    ]);
                }
            }
        }
    }
}