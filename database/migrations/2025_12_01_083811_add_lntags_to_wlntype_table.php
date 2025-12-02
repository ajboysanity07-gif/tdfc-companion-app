<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wlntype', function (Blueprint $table) {
            $table->char('lntags', 20)->nullable()->after('wlntype.lntype');
        });
    }

    public function down(): void
    {
        Schema::table('wlntype', function (Blueprint $table) {
            $table->dropColumn('lntags');
        });
    }
};
