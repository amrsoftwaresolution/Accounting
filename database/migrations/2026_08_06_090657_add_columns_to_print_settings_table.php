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
            if (!Schema::hasColumn('print_settings', 'company_id')) {
                $table->uuid('company_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('print_settings', 'primary_color')) {
                $table->string('primary_color')->nullable()->after('layout_config');
            }
            if (!Schema::hasColumn('print_settings', 'text_color')) {
                $table->string('text_color')->nullable()->after('primary_color');
            }
            if (!Schema::hasColumn('print_settings', 'page_setup')) {
                $table->json('page_setup')->nullable()->after('text_color');
            }
            if (!Schema::hasColumn('print_settings', 'block_styles')) {
                $table->json('block_styles')->nullable()->after('page_setup');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            $table->dropColumn(['company_id', 'primary_color', 'text_color', 'page_setup', 'block_styles']);
        });
    }
};
