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
        Schema::create('wln_settings', function (Blueprint $table) {
            $table->id();
            $table->string('typecode', 2)->nullable()->index();
            $table->boolean('ln_isActive')->default(true)->index();
            $table->string('ln_scheme')->nullable();
            $table->integer('max_term')->nullable();
            $table->boolean('max_term_isEditable')->default(false);
            $table->integer('max_amortization')->nullable();
            $table->boolean('max_amortization_isEditable')->default(false);
            $table->decimal('service_fee', 8, 2)->nullable();
            $table->decimal('lrf', 8, 2)->nullable();
            $table->decimal('doc_stamp', 8, 2)->nullable();
            $table->decimal('mort_notarial', 8, 2)->nullable();
            $table->text('terms_and_info')->nullable();
            $table->timestamps();

            $table->index(['typecode', 'ln_isActive']);
        });
    }

    public function down(): void { Schema::dropIfExists('wln_settings'); }
};
