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
        Schema::table('credit_invoices', function (Blueprint $table) {
            $table->string('prefix')->nullable();
        });
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->string('prefix')->nullable();
        });
        Schema::table('invoice_returns', function (Blueprint $table) {
            $table->string('prefix')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credit_invoices', function (Blueprint $table) {
            $table->dropColumn('prefix');
        });
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->dropColumn('prefix');
        });
        Schema::table('invoice_returns', function (Blueprint $table) {
            $table->dropColumn('prefix');
        });
    }
};
