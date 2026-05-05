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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->uuid('customer_id');
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('payment_date');
            $table->uuid('payment_method_id')->nullable();
            $table->uuid('deposit_to_account_id');
            $table->string('reference_no')->nullable();
            $table->text('memo')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('deposit_to_account_id')->references('id')->on('chart_of_accs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
