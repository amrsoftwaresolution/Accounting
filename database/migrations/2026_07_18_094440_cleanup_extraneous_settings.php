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
            $table->dropColumn(['show_tags', 'bill_payment_terms']);
            $table->text('low_stock_to_emails')->nullable();
            $table->text('low_stock_cc_emails')->nullable();
            $table->text('low_stock_bcc_emails')->nullable();
        });

        Schema::table('sales_settings', function (Blueprint $table) {
            $table->dropColumn([
                'preferred_invoice_terms',
                'preferred_delivery_method',
                'shipping_enabled',
                'custom_transaction_numbers_enabled',
                'service_date_enabled',
                'discount_enabled',
                'deposit_enabled',
                'tags_enabled',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['low_stock_to_emails', 'low_stock_cc_emails', 'low_stock_bcc_emails']);
            $table->boolean('show_tags')->default(true);
            $table->string('bill_payment_terms', 50)->nullable();
        });

        Schema::table('sales_settings', function (Blueprint $table) {
            $table->string('preferred_invoice_terms', 50)->nullable();
            $table->string('preferred_delivery_method', 50)->nullable();
            $table->boolean('shipping_enabled')->default(false);
            $table->boolean('custom_transaction_numbers_enabled')->default(false);
            $table->boolean('service_date_enabled')->default(false);
            $table->boolean('discount_enabled')->default(false);
            $table->boolean('deposit_enabled')->default(false);
            $table->boolean('tags_enabled')->default(false);
        });
    }
};
