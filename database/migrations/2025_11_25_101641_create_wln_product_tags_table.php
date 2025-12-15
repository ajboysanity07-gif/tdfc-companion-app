<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // CREATE if missing
        if (!Schema::hasTable('wln_product_tags')) {
            Schema::create('wln_product_tags', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id');
                $table->char('typecode', 2);

                $table->primary(['product_id', 'typecode'], 'wln_product_tags_product_id_typecode_primary');

                // Adjust product table/PK name if different
                $table->foreign('product_id', 'wln_product_tags_product_id_fk')
                    ->references('product_id')->on('wln_products')
                    ->cascadeOnDelete();
            });
            return;
        }

        // ALTER if exists: align PK/FK and column definition
        Schema::table('wln_product_tags', function (Blueprint $table) {
            // Drop existing constraints if present
            try { $table->dropForeign('wln_product_tags_typecode_foreign'); } catch (\Throwable $e) {}
            try { $table->dropForeign('wln_product_tags_typecode_fk'); } catch (\Throwable $e) {}
            try { $table->dropForeign('wln_product_tags_product_id_fk'); } catch (\Throwable $e) {}
            try { $table->dropPrimary('wln_product_tags_product_id_typecode_primary'); } catch (\Throwable $e) {}
        });

        // Align typecode to CHAR(2) NOT NULL with expected collation
        DB::statement("ALTER TABLE wln_product_tags ALTER COLUMN typecode CHAR(2) NOT NULL");

        Schema::table('wln_product_tags', function (Blueprint $table) {
            $table->primary(['product_id', 'typecode'], 'wln_product_tags_product_id_typecode_primary');

            $table->foreign('product_id', 'wln_product_tags_product_id_fk')
                ->references('product_id')->on('wln_products')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('wln_product_tags')) {
            return;
        }

        Schema::table('wln_product_tags', function (Blueprint $table) {
            try { $table->dropForeign('wln_product_tags_product_id_fk'); } catch (\Throwable $e) {}
            try { $table->dropForeign('wln_product_tags_typecode_fk'); } catch (\Throwable $e) {}
            try { $table->dropForeign('wln_product_tags_typecode_foreign'); } catch (\Throwable $e) {}
            try { $table->dropPrimary('wln_product_tags_product_id_typecode_primary'); } catch (\Throwable $e) {}
        });

        Schema::dropIfExists('wln_product_tags');
    }
};
