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
        Schema::create('cheques', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('payee_id')->nullable();
            $table->string('payee_type')->nullable(); // Customer or Supplier
            $table->uuid('bank_account_id');
            $table->date('payment_date');
            $table->string('cheque_no')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('mailing_address')->nullable();
            $table->text('memo')->nullable();
            $table->string('status')->default('posted');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('bank_account_id')->references('id')->on('chart_of_accs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cheques');
    }
};
