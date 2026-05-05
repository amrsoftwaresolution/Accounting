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
        Schema::table('chart_of_accs', function (Blueprint $table) {
            $table->dropUnique(['account_code']);
            $table->unique(['company_id', 'account_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chart_of_accs', function (Blueprint $table) {
            $table->dropUnique(['company_id', 'account_code']);
            $table->unique('account_code');
        });
    }
};
