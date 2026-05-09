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
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->uuid('payee_id')->nullable()->change();
            $table->uuid('payment_method_id')->nullable()->change();
        });

        Schema::table('journal_entry_lines', function (Blueprint $table) {
            $table->uuid('payee_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('payee_id')->nullable()->change();
            $table->unsignedBigInteger('payment_method_id')->nullable()->change();
        });

        Schema::table('journal_entry_lines', function (Blueprint $table) {
            $table->unsignedBigInteger('payee_id')->nullable()->change();
        });
    }
};
