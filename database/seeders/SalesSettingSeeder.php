<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SalesSetting;

class SalesSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SalesSetting::updateOrCreate(
            ['id' => 1], // ensures only one row
            [
                'preferred_invoice_terms' => 'Net 30',
                'preferred_delivery_method' => 'None',
                'shipping_enabled' => false,
                'custom_transaction_numbers_enabled' => true,
                'service_date_enabled' => true,
                'discount_enabled' => true,
                'deposit_enabled' => true,
                'tags_enabled' => true,

                'show_product_service_column' => true,
                'show_sku_column' => false,
                'track_quantity_price_rate' => true,

                'progress_invoicing_enabled' => true,

                'reminders_enabled' => false,

                'online_delivery_enabled' => true,
                'online_delivery_email_format' => 'short_summary',
                'online_delivery_pdf_attached' => true,
                'online_delivery_additional_option' => 'online_invoice',

                'statements_show_ageing_table' => true,
                'statements_line_detail' => 'single_line',
            ]
        );
    }
}
