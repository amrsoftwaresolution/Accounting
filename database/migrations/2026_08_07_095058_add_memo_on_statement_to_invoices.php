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
            $table->string('memo_on_statement')->nullable();
        });
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->string('memo_on_statement')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credit_invoices', function (Blueprint $table) {
            $table->dropColumn('memo_on_statement');
        });
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->dropColumn('memo_on_statement');
        });
    }
};
