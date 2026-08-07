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
        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('warranty_layout_enabled')->default(false);
            $table->boolean('job_layout_enabled')->default(false);
            $table->boolean('customer_layout_modal')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['warranty_layout_enabled', 'job_layout_enabled', 'customer_layout_modal']);
        });
    }
};
