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
        Schema::create('wln_products', function (Blueprint $table) {
            $table->id('product_id');
            $table->boolean('is_active')->default(true);
            $table->string('product_name');
            $table->boolean('is_multiple')->default(false);
            $table->string('schemes');
            $table->string('mode');
            $table->decimal('interest_rate', 5, 2);
            $table->smallInteger('max_term_days');
            $table->boolean('is_max_term_editable')->default(false);

            $table->string('max_amortization_mode', 20)->default('FIXED');
            $table->string('max_amortization_formula', 255)->nullable();
            $table->smallInteger('max_amortization')->nullable();
            
            $table->boolean('is_max_amortization_editable')->default(false);
            $table->decimal('service_fee', 5, 2);
            $table->decimal('lrf', 5, 2);
            $table->decimal('document_stamp', 5, 2);
            $table->decimal('mort_plus_notarial', 5, 2);
            $table->longText('terms');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wln_products');
    }
};
