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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('billing_period', ['weekly', 'monthly', 'yearly'])->default('monthly');
            $table->integer('max_companies')->default(1);
            $table->integer('max_chart_of_accounts')->nullable();
            $table->integer('max_products')->nullable();
            $table->integer('max_users')->nullable();
            $table->integer('max_invoices_per_month')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
