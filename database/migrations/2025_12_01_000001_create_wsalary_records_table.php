<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateWsalaryRecordsTable extends Migration
{
    public function up(): void
    {
        // Ensure acctno is unique for FK; drop old non-unique index if it exists, then add unique index
        DB::statement("
            IF EXISTS (SELECT name FROM sys.indexes WHERE name = 'app_user_table_acctno_index')
                DROP INDEX app_user_table_acctno_index ON app_user_table;
        ");
        DB::statement("
            IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'app_user_table_acctno_unique')
                CREATE UNIQUE INDEX app_user_table_acctno_unique ON app_user_table(acctno);
        ");

        Schema::create('wsalary_records', function (Blueprint $table) {
            // Matches app_user_table.acctno (length/collation)
            $table->string('acctno', 6)->primary();
            $table->decimal('salary_amount', 12, 2)->nullable();
            $table->timestamps();

            $table->foreign('acctno')
                ->references('acctno')
                ->on('app_user_table')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wsalary_records');
        DB::statement("
            IF EXISTS (SELECT name FROM sys.indexes WHERE name = 'app_user_table_acctno_unique')
                DROP INDEX app_user_table_acctno_unique ON app_user_table;
        ");
    }
}
