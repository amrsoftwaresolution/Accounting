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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('vehicle_type'); // Car, Bike, Van, Truck
            $table->string('brand');        // Toyota, Honda, Suzuki
            $table->string('model');
            $table->string('fuel_type');    // Petrol, Diesel, Electric, Hybrid

            $table->timestamps();
        });


    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
