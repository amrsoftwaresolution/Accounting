<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasCompany;

class SalesSetting extends Model
{
    use HasCompany;

    protected $fillable = [
        'company_id',
        'preferred_invoice_terms',
        'preferred_delivery_method',
        'shipping_enabled',
        'custom_transaction_numbers_enabled',
        'service_date_enabled',
        'discount_enabled',
        'deposit_enabled',
        'tags_enabled',
        'show_product_service_column',
        'show_sku_column',
        'track_quantity_price_rate',
        'progress_invoicing_enabled',
        'reminders_enabled',
        'online_delivery_enabled',
        'online_delivery_email_format',
        'online_delivery_pdf_attached',
        'online_delivery_additional_option',
        'statements_show_ageing_table',
        'statements_line_detail',
        'messages_use_greeting',
        'messages_greeting_prefix',
        'messages_greeting_token',
        'messages_sales_form',
        'messages_use_standard_message',
        'messages_email_subject',
        'messages_email_body',
        'messages_copy_to_email',
    ];

    protected $casts = [
        'shipping_enabled' => 'boolean',
        'custom_transaction_numbers_enabled' => 'boolean',
        'service_date_enabled' => 'boolean',
        'discount_enabled' => 'boolean',
        'deposit_enabled' => 'boolean',
        'tags_enabled' => 'boolean',
        'show_product_service_column' => 'boolean',
        'show_sku_column' => 'boolean',
        'track_quantity_price_rate' => 'boolean',
        'progress_invoicing_enabled' => 'boolean',
        'reminders_enabled' => 'boolean',
        'online_delivery_enabled' => 'boolean',
        'online_delivery_pdf_attached' => 'boolean',
        'statements_show_ageing_table' => 'boolean',
    ];
}
