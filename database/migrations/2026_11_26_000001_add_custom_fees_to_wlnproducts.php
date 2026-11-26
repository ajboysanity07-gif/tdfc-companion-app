<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Admin-defined fees: [{label, type: percent|fixed, value}]
    public function up(): void
    {
        Schema::table('wlnproducts', function (Blueprint $table) {
            $table->json('custom_fees')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('wlnproducts', function (Blueprint $table) {
            $table->dropColumn('custom_fees');
        });
    }
};
