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
        Schema::table('credit_notes', function (Blueprint $table) {
            $table->string('email')->nullable()->after('customer_id');
            $table->text('billing_address')->nullable()->after('email');
            $table->string('credit_note_no')->nullable()->after('date');
            $table->text('message_on_note')->nullable()->after('memo');
            $table->text('message_on_statement')->nullable()->after('message_on_note');
            $table->decimal('discount_percent', 5, 2)->default(0)->after('message_on_statement');
            $table->decimal('subtotal', 15, 2)->default(0)->after('discount_percent');
        });

        Schema::table('credit_note_lines', function (Blueprint $table) {
            $table->date('service_date')->nullable()->after('credit_note_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credit_note_lines', function (Blueprint $table) {
            $table->dropColumn('service_date');
        });

        Schema::table('credit_notes', function (Blueprint $table) {
            $table->dropColumn(['email', 'billing_address', 'credit_note_no', 'message_on_note', 'message_on_statement', 'discount_percent', 'subtotal']);
        });
    }
};
