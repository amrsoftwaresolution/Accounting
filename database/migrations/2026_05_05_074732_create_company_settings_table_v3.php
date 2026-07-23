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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            // Expense Settings
            $table->text('low_stock_to_emails')->nullable();
            $table->text('low_stock_cc_emails')->nullable();
            $table->text('low_stock_bcc_emails')->nullable();

            $table->string('acct_method', 50)->default('Accrual');
            $table->string('fin_year_start', 20)->default('January');
            $table->string('tax_year_start', 50)->default('Same as financial year');
            $table->boolean('close_books')->default(false);
            $table->string('tax_form', 100)->default('Partnership or limited liability company');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
