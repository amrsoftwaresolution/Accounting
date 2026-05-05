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
        Schema::create('sales_receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('customer_id')->nullable();
            $table->string('email')->nullable();
            $table->text('billing_address')->nullable();
            $table->date('date')->nullable();
            $table->uuid('payment_method')->nullable();
            $table->string('reference_no')->nullable();
            $table->unsignedBigInteger('deposit_to')->nullable();
            $table->string('receipt_no')->nullable();
            $table->text('message_on_receipt')->nullable();
            $table->text('message_on_statement')->nullable();
            $table->json('items')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_receipts');
    }
};
