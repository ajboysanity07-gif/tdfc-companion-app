<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wlnproducts', function (Blueprint $table) {
            $table->id();
            $table->string('typecode', 2)->unique();
            $table->string('lntype')->nullable();
            $table->decimal('int_rate', 8, 2)->nullable();
            $table->boolean('rate_isEditable')->default(false);
            $table->boolean('allow_multiple')->default(false);
            $table->string('installment_mode')->default('MONTHLY');
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
            $table->boolean('ln_isActive')->default(false);
            $table->boolean('isDisplayed')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wlnproducts');
    }
};
