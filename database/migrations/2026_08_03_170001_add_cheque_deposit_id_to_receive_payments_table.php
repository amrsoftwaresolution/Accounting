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
        Schema::table('receive_payments', function (Blueprint $table) {
            $table->uuid('cheque_deposit_id')->nullable()->after('memo');
            $table->foreign('cheque_deposit_id')->references('id')->on('cheque_deposits')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receive_payments', function (Blueprint $table) {
            $table->dropForeign(['cheque_deposit_id']);
            $table->dropColumn('cheque_deposit_id');
        });
    }
};
