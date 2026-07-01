<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (!Schema::hasColumn('expenses', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->after('payment_account_id')->constrained('currencies')->restrictOnDelete();
            }

            if (!Schema::hasColumn('expenses', 'exchange_rate')) {
                $table->decimal('exchange_rate', 15, 6)->nullable()->after('currency_id');
            }

            if (!Schema::hasColumn('expenses', 'amount_in_base_currency')) {
                $table->decimal('amount_in_base_currency', 15, 2)->nullable()->after('exchange_rate');
            }
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (Schema::hasColumn('expenses', 'amount_in_base_currency')) {
                $table->dropColumn('amount_in_base_currency');
            }
            if (Schema::hasColumn('expenses', 'exchange_rate')) {
                $table->dropColumn('exchange_rate');
            }
            if (Schema::hasColumn('expenses', 'currency_id')) {
                $table->dropForeign(['currency_id']);
                $table->dropColumn('currency_id');
            }
        });
    }
};
