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
