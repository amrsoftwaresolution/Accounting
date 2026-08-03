<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bill_payments', function (Blueprint $table) {
            if (!Schema::hasColumn('bill_payments', 'check_date')) {
                $table->date('check_date')->nullable()->after('payment_method_id');
            }
            if (!Schema::hasColumn('bill_payments', 'check_number')) {
                $table->string('check_number')->nullable()->after('check_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bill_payments', function (Blueprint $table) {
            if (Schema::hasColumn('bill_payments', 'check_number')) {
                $table->dropColumn('check_number');
            }
            if (Schema::hasColumn('bill_payments', 'check_date')) {
                $table->dropColumn('check_date');
            }
        });
    }
};
