<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'work_week_start',
                'show_service_field',
                'allow_billable_time',
                'show_billing_rate'
            ]);
        });

        Schema::table('advanced_settings', function (Blueprint $table) {
            $table->dropColumn([
                'enable_acct_nums',
                'discount_acct',
                'auto_prefill',
                'auto_invoice_groups',
                'auto_apply_bills',
                'language'
            ]);
        });

        Schema::table('sales_settings', function (Blueprint $table) {
            $table->dropColumn([
                'show_product_service_column',
                'show_sku_column',
                'track_quantity_price_rate',
                'online_delivery_enabled',
                'online_delivery_email_format',
                'online_delivery_pdf_attached',
                'online_delivery_additional_option'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('work_week_start')->default('Monday');
            $table->boolean('show_service_field')->default(false);
            $table->boolean('allow_billable_time')->default(false);
            $table->boolean('show_billing_rate')->default(false);
        });

        Schema::table('advanced_settings', function (Blueprint $table) {
            $table->boolean('enable_acct_nums')->default(false);
            $table->string('discount_acct')->nullable();
            $table->boolean('auto_prefill')->default(false);
            $table->boolean('auto_invoice_groups')->default(false);
            $table->boolean('auto_apply_bills')->default(false);
            $table->string('language')->default('English');
        });

        Schema::table('sales_settings', function (Blueprint $table) {
            $table->boolean('show_product_service_column')->default(false);
            $table->boolean('show_sku_column')->default(false);
            $table->boolean('track_quantity_price_rate')->default(false);
            $table->boolean('online_delivery_enabled')->default(false);
            $table->string('online_delivery_email_format')->nullable();
            $table->boolean('online_delivery_pdf_attached')->default(false);
            $table->string('online_delivery_additional_option')->nullable();
        });
    }
};
