<?php

namespace Database\Seeders;

use App\Models\WarrantyPolicy;
use Illuminate\Database\Seeder;

class WarrantyPolicySeeder extends Seeder
{
    public function run(): void
    {
        $policies = [
            [
                'name' => 'Wheel Alignment Warranty',
                'applies_to' => 'service',
                'duration_days' => 30,
                'duration_km' => 1000,
                'expiry_rule' => 'whichever_first',
                'terms_text' => 'Covers wheel alignment service for 30 days or 1,000 km, whichever occurs first. Warranty applies to alignment related issues only.',
                'is_active' => true,
            ],
            [
                'name' => 'Oil Filter Warranty',
                'applies_to' => 'product',
                'duration_days' => 90,
                'duration_km' => 5000,
                'expiry_rule' => 'whichever_first',
                'terms_text' => 'Covers replacement of oil filter part for 90 days or 5,000 km. Applies to manufacturing defects and leakage only.',
                'is_active' => true,
            ],
            [
                'name' => 'Brake Pads Warranty',
                'applies_to' => 'product',
                'duration_days' => 180,
                'duration_km' => 10000,
                'expiry_rule' => 'whichever_first',
                'terms_text' => 'Covers brake pad replacement for 180 days or 10,000 km due to workmanship or premature wear.',
                'is_active' => true,
            ],
            [
                'name' => 'Battery Warranty',
                'applies_to' => 'product',
                'duration_days' => 365,
                'duration_km' => null,
                'expiry_rule' => 'days_only',
                'terms_text' => 'Covers battery replacement for one year from installation date for failure due to manufacturing defects.',
                'is_active' => true,
            ],
            [
                'name' => 'Tire Rotation Warranty',
                'applies_to' => 'service',
                'duration_days' => 60,
                'duration_km' => 3000,
                'expiry_rule' => 'whichever_first',
                'terms_text' => 'Covers tire rotation service for 60 days or 3,000 km, whichever occurs first.',
                'is_active' => true,
            ],
            [
                'name' => 'AC Service Warranty',
                'applies_to' => 'service',
                'duration_days' => 90,
                'duration_km' => null,
                'expiry_rule' => 'days_only',
                'terms_text' => 'Covers air conditioning service labor for 90 days from service date.',
                'is_active' => true,
            ],
        ];

        foreach ($policies as $policy) {
            WarrantyPolicy::updateOrCreate([
                'name' => $policy['name'],
            ], $policy);
        }
    }
}
