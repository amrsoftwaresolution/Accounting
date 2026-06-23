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
        Schema::create('cheque_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cheque_id');
            $table->uuid('category_account_id')->nullable();
            $table->string('description')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->uuid('customer_id')->nullable();
            $table->integer('line_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('cheque_id')->references('id')->on('cheques')->onDelete('cascade');
            $table->foreign('category_account_id')->references('id')->on('chart_of_accs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cheque_lines');
    }
};
