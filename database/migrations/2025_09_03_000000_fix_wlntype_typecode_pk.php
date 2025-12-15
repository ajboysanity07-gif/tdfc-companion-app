<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Indexes on wlntype
        if (Schema::hasTable('wlntype')) {
            DB::statement("ALTER TABLE wlntype ALTER COLUMN typecode CHAR(2) NOT NULL");
            Schema::table('wlntype', function (Blueprint $table) {
                $table->primary('typecode', 'wlntype_typecode_pk');
                $table->index('controlno', 'wlntype_controlno_idx');
            });
        }

        // Indexes on Amortsched
        if (Schema::hasTable('Amortsched')) {
            Schema::table('Amortsched', function (Blueprint $table) {
                $table->index('lnnumber', 'amortsched_lnnumber_idx');
                $table->index('controlno', 'amortsched_controlno_idx');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('wlntype')) {
            Schema::table('wlntype', function (Blueprint $table) {
                $table->dropPrimary('wlntype_typecode_pk');
                $table->dropIndex('wlntype_controlno_idx');
            });
        }

        if (Schema::hasTable('Amortsched')) {
            Schema::table('Amortsched', function (Blueprint $table) {
                $table->dropIndex('amortsched_lnnumber_idx');
                $table->dropIndex('amortsched_controlno_idx');
            });
        }
    }
};
