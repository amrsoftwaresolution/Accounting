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
        Schema::table('sales_settings', function (Blueprint $table) {
            $table->boolean('messages_use_greeting')->default(false)->after('progress_invoicing_enabled');
            $table->string('messages_greeting_prefix', 50)->nullable()->after('messages_use_greeting');
            $table->string('messages_greeting_token', 50)->nullable()->after('messages_greeting_prefix');
            $table->string('messages_sales_form', 50)->nullable()->after('messages_greeting_token');
            $table->boolean('messages_use_standard_message')->default(false)->after('messages_sales_form');
            $table->string('messages_email_subject', 255)->nullable()->after('messages_use_standard_message');
            $table->text('messages_email_body')->nullable()->after('messages_email_subject');
            $table->boolean('messages_copy_to_email')->default(false)->after('messages_email_body');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_settings', function (Blueprint $table) {
            $table->dropColumn([
                'messages_use_greeting',
                'messages_greeting_prefix',
                'messages_greeting_token',
                'messages_sales_form',
                'messages_use_standard_message',
                'messages_email_subject',
                'messages_email_body',
                'messages_copy_to_email',
            ]);
        });
    }
};
