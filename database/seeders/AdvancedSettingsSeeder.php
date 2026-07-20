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
                'acct_method' => 'Accrual',
                'fin_year_start' => 'January',
                'tax_year_start' => 'Same as financial year',
                'close_books' => false,
                'tax_form' => 'Partnership or limited liability company',
                'warn_dup_cheque' => false,
                'warn_dup_bill' => false,
                'warn_dup_journal' => false,
                'sign_out_inactive' => '1 hour',
            ]
        );
    }
}