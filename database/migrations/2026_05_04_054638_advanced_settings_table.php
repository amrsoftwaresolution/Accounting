<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('advanced_settings', function (Blueprint $table) {
            $table->id();
            // Accounting settings
            $table->string('acct_method', 50)->default('Accrual');
            $table->string('fin_year_start', 20)->default('January');
            $table->string('tax_year_start', 50)->default('Same as financial year');
            $table->boolean('close_books')->default(false);
            $table->string('tax_form', 100)->default('Partnership or limited liability company');


            // Warnings
            $table->boolean('warn_dup_cheque')->default(false);
            $table->boolean('warn_dup_bill')->default(false);
            $table->boolean('warn_dup_journal')->default(false);

            // Other
            $table->string('sign_out_inactive', 20)->default('1 hour');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advanced_settings');
    }
};
