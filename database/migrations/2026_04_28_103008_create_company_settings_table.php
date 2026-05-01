<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
        $table->id();
        // Company
        $table->string('company_name');
        $table->string('company_email')->nullable();
        $table->string('phone')->nullable();
        $table->text('address')->nullable();
        $table->string('website')->nullable();
        $table->string('industry')->nullable();
        $table->string('logo_path')->nullable();

        // Legal
        $table->string('legal_name')->nullable();
        $table->string('tax_id')->nullable();
        $table->string('business_type')->nullable();
        $table->text('legal_address')->nullable();

        // Currency
        $table->string('home_currency')->default('USD');
        $table->boolean('multicurrency')->default(false);

        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
