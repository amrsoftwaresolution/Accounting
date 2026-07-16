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
        Schema::create('print_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('document_type'); // e.g. 'invoice', 'bill'
            $table->string('custom_title')->nullable();
            $table->string('header_alignment')->default('left');
            $table->text('static_footer_content')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'document_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_settings');
    }
};
