<?php
// database/migrations/2025_10_27_000000_create_rejection_reasons_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRejectionReasonsTable extends Migration
{
    public function up()
    {
        Schema::create('rejection_reasons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->timestamps();
        });
    }
    public function down()
    {
        Schema::dropIfExists('rejection_reasons');
    }
}
