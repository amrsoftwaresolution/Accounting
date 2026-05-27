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
        Schema::table('bill_items', function (Blueprint $table) {
            $table->uuid('item_id')->nullable()->after('bill_id');
            $table->decimal('quantity', 15, 2)->default(1)->after('description');
            $table->decimal('rate', 15, 2)->default(0)->after('quantity');
        });

        Schema::table('expense_items', function (Blueprint $table) {
            $table->uuid('item_id')->nullable()->after('expense_id');
            $table->decimal('quantity', 15, 2)->default(1)->after('description');
            $table->decimal('rate', 15, 2)->default(0)->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bill_items', function (Blueprint $table) {
            $table->dropColumn(['item_id', 'quantity', 'rate']);
        });

        Schema::table('expense_items', function (Blueprint $table) {
            $table->dropColumn(['item_id', 'quantity', 'rate']);
        });
    }
};
