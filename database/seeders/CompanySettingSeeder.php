<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use Illuminate\Database\Seeder;

class CompanySettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CompanySetting::updateOrCreate(
            ['id' => 1], // Ensure we only ever have one record
            [
                // Company Info
                'company_name'   => 'Fingrow Solutions Ltd',
                'company_email'  => 'hello@fingrow.example.com',
                'phone'          => '+94 11 234 5678',
                'address'        => '123 Business Park, Colombo 03, Sri Lanka',
                'website'        => 'https://fingrow.example.com',
                'industry'       => 'Financial Services',
                'logo_path'      => null, // Can be updated via UI

                // Legal Info
                'legal_name'     => 'Fingrow Solutions Private Limited',
                'tax_id'         => 'PV-00234567',
                'business_type'  => 'Partnership or limited liability company',
                'legal_address'  => '123 Business Park, Colombo 03, Sri Lanka',

                // Currency Info
                'home_currency'  => 'Sri Lankan Rupee',
                'multicurrency'  => false,
            ]
        );
    }
}
