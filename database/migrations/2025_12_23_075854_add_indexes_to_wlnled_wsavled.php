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
        Schema::table('wlnled', function (Blueprint $table) {
            $table->index('controlno');
            $table->index('lnnumber');
            $table->index('acctno');
            $table->index('transno');
        });

        Schema::table('wsavled', function (Blueprint $table) {
            $table->index('acctno');
            $table->index('svnumber');
            $table->index('transno');
            $table->index('controlno');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wlnled', function (Blueprint $table) {
            $table->dropIndex(['controlno']);
            $table->dropIndex(['lnnumber']);
            $table->dropIndex(['acctno']);
            $table->dropIndex(['transno']);
        });

        Schema::table('wsavled', function (Blueprint $table) {
            $table->dropIndex(['acctno']);
            $table->dropIndex(['svnumber']);
            $table->dropIndex(['transno']);
            $table->dropIndex(['controlno']);
        });
    }
};
