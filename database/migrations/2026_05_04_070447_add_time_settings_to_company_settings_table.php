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
            $table->string('work_week_start', 20)->default('Monday')->after('multicurrency');
            $table->boolean('show_service_field')->default(true)->after('work_week_start');
            $table->boolean('allow_billable_time')->default(true)->after('show_service_field');
            $table->boolean('show_billing_rate')->default(false)->after('allow_billable_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'work_week_start',
                'show_service_field',
                'allow_billable_time',
                'show_billing_rate',
            ]);
        });
    }
};
