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
        Schema::table('wln_products', function (Blueprint $table) {
            // Increase precision for fee columns to support values up to 99999.99
            $table->decimal('service_fee', 10, 2)->nullable()->change();
            $table->decimal('lrf', 10, 2)->nullable()->change();
            $table->decimal('document_stamp', 10, 2)->nullable()->change();
            $table->decimal('mort_plus_notarial', 10, 2)->nullable()->change();
            $table->decimal('interest_rate', 10, 4)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wln_products', function (Blueprint $table) {
            // Revert back to original precision
            $table->decimal('service_fee', 5, 2)->nullable()->change();
            $table->decimal('lrf', 5, 2)->nullable()->change();
            $table->decimal('document_stamp', 5, 2)->nullable()->change();
            $table->decimal('mort_plus_notarial', 5, 2)->nullable()->change();
            $table->decimal('interest_rate', 5, 2)->change();
        });
    }
};
