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
        Schema::create('items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('type'); // service, product
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            
            $table->decimal('sale_price', 15, 2)->default(0);
            $table->foreignUuid('income_account_id')->nullable()->constrained('chart_of_accs')->onDelete('set null');
            
            $table->decimal('purchase_price', 15, 2)->default(0);
            $table->foreignUuid('expense_account_id')->nullable()->constrained('chart_of_accs')->onDelete('set null');
            
            $table->boolean('track_inventory')->default(false);
            $table->decimal('quantity_on_hand', 15, 2)->default(0);
            $table->foreignUuid('inventory_account_id')->nullable()->constrained('chart_of_accs')->onDelete('set null');
            
            $table->foreignUuid('item_category_id')->nullable()->constrained('item_categories')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
