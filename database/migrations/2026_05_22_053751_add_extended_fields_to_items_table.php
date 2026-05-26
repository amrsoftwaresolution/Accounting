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
        Schema::table('items', function (Blueprint $table) {
            $table->date('as_of_date')->nullable();
            $table->decimal('reorder_point', 15, 2)->default(0);
            $table->text('purchase_description')->nullable();
            $table->foreignUuid('preferred_supplier_id')->nullable()->constrained('suppliers')->onDelete('set null');
            $table->boolean('is_sold')->default(true);
            $table->boolean('is_purchased')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropForeign(['preferred_supplier_id']);
            $table->dropColumn([
                'as_of_date',
                'reorder_point',
                'purchase_description',
                'preferred_supplier_id',
                'is_sold',
                'is_purchased'
            ]);
        });
    }
};
