<?php

namespace Database\Seeders;

use App\Models\AdvancedSettings;
use Illuminate\Database\Seeder;

class AdvancedSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AdvancedSettings::updateOrCreate(
            ['id' => 1],
            [
                'company_id' => 1, // Fixed: Added required relationship field
                'acct_method' => 'Accrual',
                'fin_year_start' => 'January',
                'tax_year_start' => 'Same as financial year',
                'close_books' => false,
                'tax_form' => 'Partnership or limited liability company',
                'enable_acct_nums' => false,
                'discount_acct' => 'Discounts given',
                'auto_prefill' => false,
                'auto_invoice_groups' => false,
                'auto_apply_bills' => false,
                'language' => 'English',
                'date_format' => 'mm/dd/yyyy',
                'currency_format' => '$123,456.00',
                'warn_dup_cheque' => false,
                'warn_dup_bill' => false,
                'warn_dup_journal' => false,
                'sign_out_inactive' => '1 hour',
            ]
        );
    }
}