<?php
// database/migrations/2025_10_27_000001_create_app_user_rejection_reason_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppUserRejectionReasonTable extends Migration
{
    public function up()
    {
        Schema::create('app_user_rejection_reason', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('rejection_reason_id');
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('app_user_table')->onDelete('cascade');
            $table->foreign('rejection_reason_id')->references('id')->on('rejection_reasons')->onDelete('cascade');
        });
    }
    public function down()
    {
        Schema::dropIfExists('app_user_rejection_reason');
    }
}

