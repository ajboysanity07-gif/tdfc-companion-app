<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('wln_product_tags') || !Schema::hasTable('wlntype')) {
            return;
        }

        // Drop FK and PK before altering the column (guarded for missing constraints)
        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_fk') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_fk");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_foreign') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_foreign");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'wln_product_tags_product_id_typecode_primary') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_product_id_typecode_primary");

        DB::statement("ALTER TABLE wln_product_tags ALTER COLUMN typecode CHAR(2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL");

        // Recreate PK and FK
        Schema::table('wln_product_tags', function (Blueprint $table) {
            $table->primary(['product_id', 'typecode'], 'wln_product_tags_product_id_typecode_primary');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('wln_product_tags')) {
            return;
        }

        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_fk') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_fk");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'wln_product_tags_typecode_foreign') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_typecode_foreign");
        DB::statement("IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'wln_product_tags_product_id_typecode_primary') ALTER TABLE wln_product_tags DROP CONSTRAINT wln_product_tags_product_id_typecode_primary");

        // Optional: revert to nullable if needed
        // DB::statement("ALTER TABLE wln_product_tags ALTER COLUMN typecode CHAR(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL");
    }
};
