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
        Schema::create('inventory_quantity_adjustments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->date('adjustment_date');
            $table->string('reference_number')->nullable();
            $table->string('adjustment_reason')->nullable();
<<<<<<< HEAD
            $table->foreignUuid('inventory_adjustment_account_id')->nullable()->constrained('chart_of_accs', indexName: 'fk_inv_adj_acc_id')->nullOnDelete();
=======
            $table->uuid('inventory_adjustment_account_id')->nullable();
            $table->foreign('inventory_adjustment_account_id', 'fk_inv_adj_acc_id')
                ->references('id')
                ->on('chart_of_accs')
                ->nullOnDelete();
>>>>>>> 6d0d435a033b9d4ac792157d5af0b462f7470bca
            $table->text('memo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_quantity_adjustments');
    }
};
