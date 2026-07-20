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
        Schema::create('devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('company_id')->constrained()->onDelete('cascade');
            $table->uuid('customer_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['vehicle', 'electronics'])->default('vehicle');
            
            // Common
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            
            // Vehicle specific
            $table->string('year')->nullable();
            $table->string('vehicle_number')->nullable();
            $table->string('chassis_number')->nullable();
            $table->string('engine_number')->nullable();
            $table->string('fuel_type')->nullable();
            $table->string('color')->nullable();
            $table->string('mileage')->nullable();
            
            // Electronics specific
            $table->string('serial_number')->nullable();
            $table->string('imei')->nullable();
            $table->string('warranty')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
