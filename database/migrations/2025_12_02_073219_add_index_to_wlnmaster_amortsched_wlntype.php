<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Composite indexes on Amortsched for vloandue view
        if (Schema::hasTable('Amortsched')) {
            Schema::table('Amortsched', function (Blueprint $table) {
                $table->index(['lnnumber', 'controlno'], 'amortsched_lnnumber_controlno_idx');
                $table->index(['lnnumber', 'Date_pay'], 'amortsched_lnnumber_datepay_idx');
            });
        }

        // Composite index on wlnmaster for vloandue view
        if (Schema::hasTable('wlnmaster')) {
            Schema::table('wlnmaster', function (Blueprint $table) {
                $table->index(['lnnumber','balance','acctno'], 'wlnmaster_lnnumber_balance_acctno_idx');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('Amortsched')) {
            Schema::table('Amortsched', function (Blueprint $table) {
                $table->dropIndex('amortsched_lnnumber_controlno_idx');
                $table->dropIndex('amortsched_lnnumber_datepay_idx');
            });
        }

        if (Schema::hasTable('wlnmaster')) {
            Schema::table('wlnmaster', function (Blueprint $table) {
                $table->dropIndex('wlnmaster_balance_lnnumber_idx');
            });
        }
    }
};
