<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWsalaryRecordsTable extends Migration
{
    public function up()
    {
        Schema::create('wsalary_records', function (Blueprint $table) {
            $table->id(); // Primary key, indexed by default
            $table->string('acctno')->index(); // Use .index() for fast lookup
            $table->decimal('salary_amount', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps(); // created_at, updated_at
        });

        // Removed app_user_table index creation to avoid duplicate index
    }

    public function down()
    {
        Schema::dropIfExists('wsalary_records');

        // Removed app_user_table index drop to avoid accidental removal
    }
}
