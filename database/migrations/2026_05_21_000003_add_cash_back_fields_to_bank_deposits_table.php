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
        Schema::table('bank_deposits', function (Blueprint $table) {
            $table->uuid('cash_back_account_id')->nullable()->after('deposit_to_account_id');
            $table->text('cash_back_memo')->nullable()->after('cash_back_account_id');
            $table->decimal('cash_back_amount', 15, 2)->default(0)->after('cash_back_memo');

            $table->foreign('cash_back_account_id')
                ->references('id')
                ->on('chart_of_accs')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_deposits', function (Blueprint $table) {
            $table->dropForeign(['cash_back_account_id']);
            $table->dropColumn(['cash_back_account_id', 'cash_back_memo', 'cash_back_amount']);
        });
    }
};
