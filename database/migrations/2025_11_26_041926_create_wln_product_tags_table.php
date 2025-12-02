<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wln_product_tags', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id');
            $table->string('typecode', 2);
            $table->timestamps();
        });

        // Force SQL Server to use non-Unicode CHAR(2) so it matches wlntype.typecode for the FK.
        DB::statement("ALTER TABLE wln_product_tags ALTER COLUMN typecode CHAR(2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL");

        Schema::table('wln_product_tags', function (Blueprint $table) {
            $table->primary(['product_id', 'typecode']);
            $table->foreign('product_id')->references('product_id')->on('wln_products')->onDelete('cascade');
            $table->foreign('typecode')->references('typecode')->on('wlntype')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wln_product_tags');
    }
};
