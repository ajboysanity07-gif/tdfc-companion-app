<?php
// database/migrations/2025_10_27_000002_remove_rejection_reason_from_app_user_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveRejectionReasonFromAppUserTable extends Migration
{
    public function up()
    {
        Schema::table('app_user_table', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });
    }
    public function down()
    {
        Schema::table('app_user_table', function (Blueprint $table) {
            $table->string('rejection_reason')->nullable();
        });
    }
}

