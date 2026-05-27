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
        if (! Schema::hasTable('users')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->string('invite_token', 128)->nullable()->unique()->after('password');
            $table->timestamp('invite_expires_at')->nullable()->after('invite_token');
            $table->boolean('is_invited')->default(false)->after('invite_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'invite_token')) {
                $table->dropUnique(['invite_token']);
                $table->dropColumn(['invite_token']);
            }

            if (Schema::hasColumn('users', 'invite_expires_at')) {
                $table->dropColumn(['invite_expires_at']);
            }

            if (Schema::hasColumn('users', 'is_invited')) {
                $table->dropColumn(['is_invited']);
            }

            $table->string('password')->nullable(false)->change();
        });
    }
};
