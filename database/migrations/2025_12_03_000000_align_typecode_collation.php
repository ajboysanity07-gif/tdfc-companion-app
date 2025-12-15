<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('wlntype') || !Schema::hasTable('wln_product_tags')) {
            return;
        }

        // Drop existing constraints only if they exist (avoid failures when FK was never created)
        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_fk') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_fk");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_foreign') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_foreign");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'wln_product_tags_product_id_typecode_primary') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_product_id_typecode_primary");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'wlntype_typecode_pk') ALTER TABLE wlntype DROP CONSTRAINT wlntype_typecode_pk");

        DB::statement("ALTER TABLE wlntype ALTER COLUMN typecode CHAR(2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL");
        DB::statement("ALTER TABLE wln_product_tags ALTER COLUMN typecode CHAR(2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL");

        Schema::table('wlntype', function (Blueprint $table) {
            $table->primary('typecode', 'wlntype_typecode_pk');
        });

        Schema::table('wln_product_tags', function (Blueprint $table) {
            $table->primary(['product_id', 'typecode'], 'wln_product_tags_product_id_typecode_primary');
            $table->foreign('typecode', 'wln_product_tags_typecode_fk')
                ->references('typecode')->on('wlntype')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('wlntype') || !Schema::hasTable('wln_product_tags')) {
            return;
        }

        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_fk') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_fk");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_foreign') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_foreign");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'wln_product_tags_product_id_typecode_primary') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_product_id_typecode_primary");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'wlntype_typecode_pk') ALTER TABLE wlntype DROP CONSTRAINT wlntype_typecode_pk");

        DB::statement("ALTER TABLE wlntype ALTER COLUMN typecode CHAR(2) COLLATE DATABASE_DEFAULT NOT NULL");
        DB::statement("ALTER TABLE wln_product_tags ALTER COLUMN typecode CHAR(2) COLLATE DATABASE_DEFAULT NOT NULL");

        Schema::table('wlntype', function (Blueprint $table) {
            $table->primary('typecode', 'wlntype_typecode_pk');
        });

        Schema::table('wln_product_tags', function (Blueprint $table) {
            $table->primary(['product_id', 'typecode'], 'wln_product_tags_product_id_typecode_primary');
            $table->foreign('typecode', 'wln_product_tags_typecode_fk')
                ->references('typecode')->on('wlntype')
                ->cascadeOnDelete();
        });
    }
};
