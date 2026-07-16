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
        Schema::table('print_settings', function (Blueprint $table) {
            $table->string('primary_color')->default('#111827')->after('layout_config');
            $table->string('text_color')->default('#374151')->after('primary_color');
            $table->json('page_setup')->nullable()->after('text_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            $table->dropColumn(['primary_color', 'text_color', 'page_setup']);
        });
    }
};
