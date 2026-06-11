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
        Schema::create('bill_payment_allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('bill_payment_id');
            $table->uuid('bill_id');
            $table->decimal('amount_applied', 15, 2);
            $table->timestamps();

            $table->foreign('bill_payment_id')->references('id')->on('bill_payments')->onDelete('cascade');
            $table->foreign('bill_id')->references('id')->on('bills')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_payment_allocations');
    }
};
