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
        Schema::table('supplier_credit_note_items', function (Blueprint $table) {
            $table->uuid('item_id')->nullable()->change();
            $table->foreignUuid('chart_of_acc_id')->nullable()->after('item_id')->constrained('chart_of_accs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supplier_credit_note_items', function (Blueprint $table) {
            $table->dropForeign(['chart_of_acc_id']);
            $table->dropColumn('chart_of_acc_id');
            $table->uuid('item_id')->nullable(false)->change();
        });
    }
};
