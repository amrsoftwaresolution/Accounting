<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('nic')->nullable()->after('phone_number');
            $table->string('passport')->nullable()->after('nic');
            $table->string('address')->nullable()->after('passport');
            $table->string('vehicle_id')->nullable()->after('address');
            $table->unsignedInteger('customer_number')->unique()->nullable()->after('vehicle_id');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['nic', 'passport', 'address', 'vehicle_id', 'customer_number']);
        });
    }
};