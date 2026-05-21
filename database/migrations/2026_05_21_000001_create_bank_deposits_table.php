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
        Schema::create('bank_deposits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('deposit_no')->nullable();
            $table->date('deposit_date');
            $table->uuid('deposit_to_account_id')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('memo')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();

            $table->foreign('deposit_to_account_id')->references('id')->on('chart_of_accs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_deposits');
    }
};
