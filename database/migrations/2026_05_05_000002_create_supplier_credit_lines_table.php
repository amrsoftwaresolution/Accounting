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
        Schema::create('supplier_credit_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_credit_id')->constrained('supplier_credits')->onDelete('cascade');
            $table->uuid('account_id');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->timestamps();

            $table->foreign('account_id')->references('id')->on('chart_of_accs')->onDelete('cascade');
            $table->index('supplier_credit_id');
            $table->index('account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_credit_lines');
    }
};
