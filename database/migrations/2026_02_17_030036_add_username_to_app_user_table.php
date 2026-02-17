<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('app_user_table') || Schema::hasColumn('app_user_table', 'username')) {
            return;
        }

        Schema::table('app_user_table', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->after('email');
        });

        DB::statement("
            IF NOT EXISTS (
                SELECT name FROM sys.indexes WHERE name = 'app_user_table_username_unique'
            )
            CREATE UNIQUE INDEX app_user_table_username_unique ON app_user_table(username) WHERE username IS NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('app_user_table') || ! Schema::hasColumn('app_user_table', 'username')) {
            return;
        }

        DB::statement("
            IF EXISTS (
                SELECT name FROM sys.indexes WHERE name = 'app_user_table_username_unique'
            )
            DROP INDEX app_user_table_username_unique ON app_user_table
        ");

        Schema::table('app_user_table', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};
