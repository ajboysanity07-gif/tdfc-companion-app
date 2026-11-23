<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wlnproducts', function (Blueprint $table) {
            $table->string('max_amortization_mode', 20)->default('FIXED');
            $table->string('max_amortization_formula', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('wlnproducts', function (Blueprint $table) {
            $table->dropColumn(['max_amortization_mode', 'max_amortization_formula']);
        });
    }
};
