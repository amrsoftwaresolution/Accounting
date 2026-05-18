<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            ['name' => 'Cash', 'slug' => 'cash'],
            ['name' => 'Credit Card', 'slug' => 'credit-card'],
            ['name' => 'Bank Transfer', 'slug' => 'bank-transfer'],
            ['name' => 'Cheque', 'slug' => 'cheque'],
        ];

        foreach ($methods as $method) {
            \App\Models\PaymentMethod::updateOrCreate(
                [
                    'company_id' => 1, // Fixed: Scopes the unique check to the company
                    'slug' => $method['slug']
                ], 
                [
                    'name' => $method['name'],
                    'company_id' => 1 // Fixed: Passes the required field for creation
                ]
            );
        }
    }
}