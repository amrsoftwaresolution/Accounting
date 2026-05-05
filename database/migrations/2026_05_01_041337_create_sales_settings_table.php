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
        Schema::create('sales_settings', function (Blueprint $table) {
            $table->id();

            // Sales Form Content
            $table->string('preferred_invoice_terms', 50)->default('Net 30');
            $table->string('preferred_delivery_method', 50)->default('None');
            $table->boolean('shipping_enabled')->default(false);
            $table->boolean('custom_transaction_numbers_enabled')->default(true);
            $table->boolean('service_date_enabled')->default(true);
            $table->boolean('discount_enabled')->default(true);
            $table->boolean('deposit_enabled')->default(true);
            $table->boolean('tags_enabled')->default(true);

            // Products & Services
            $table->boolean('show_product_service_column')->default(true);
            $table->boolean('show_sku_column')->default(false);
            $table->boolean('track_quantity_price_rate')->default(true);

            // Progress Invoicing
            $table->boolean('progress_invoicing_enabled')->default(true);

            // Messages
            $table->boolean('messages_use_greeting')->default(false);
            $table->string('messages_greeting_prefix', 50)->nullable();
            $table->string('messages_greeting_token', 50)->nullable();
            $table->string('messages_sales_form', 50)->nullable();
            $table->boolean('messages_use_standard_message')->default(false);
            $table->string('messages_email_subject', 255)->nullable();
            $table->text('messages_email_body')->nullable();
            $table->boolean('messages_copy_to_email')->default(false);

            // Reminders
            $table->boolean('reminders_enabled')->default(false);

            // Online Delivery
            $table->boolean('online_delivery_enabled')->default(true);
            $table->string('online_delivery_email_format', 50)->default('short_summary');
            $table->boolean('online_delivery_pdf_attached')->default(true);
            $table->string('online_delivery_additional_option', 50)->default('online_invoice');

            // Statements
            $table->boolean('statements_show_ageing_table')->default(true);
            $table->string('statements_line_detail', 50)->default('single_line');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_settings');
    }
};
