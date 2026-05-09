<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('journal_entries')) {
            DB::statement("ALTER TABLE `journal_entries` MODIFY `payee_id` char(36) NULL");
            DB::statement("ALTER TABLE `journal_entries` MODIFY `payment_method_id` char(36) NULL");
        }

        if (Schema::hasTable('journal_entry_lines')) {
            DB::statement("ALTER TABLE `journal_entry_lines` MODIFY `payee_id` char(36) NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('journal_entries')) {
            DB::statement("ALTER TABLE `journal_entries` MODIFY `payee_id` bigint unsigned NULL");
            DB::statement("ALTER TABLE `journal_entries` MODIFY `payment_method_id` bigint unsigned NULL");
        }

        if (Schema::hasTable('journal_entry_lines')) {
            DB::statement("ALTER TABLE `journal_entry_lines` MODIFY `payee_id` bigint unsigned NULL");
        }
    }
};
