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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            
            // Time Settings
            $table->string('work_week_start', 20)->default('Monday');
            $table->boolean('show_service_field')->default(true);
            $table->boolean('allow_billable_time')->default(true);
            $table->boolean('show_billing_rate')->default(false);

            // Expense Settings
            $table->boolean('show_tags')->default(true);
            $table->string('bill_payment_terms', 50)->default('Net 30');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
