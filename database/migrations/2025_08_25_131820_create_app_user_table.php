<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_user_table', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('acctno', 6)->nullable()->index()->comment('FK to wmaster.acctno; length/collation must match legacy.');
            $table->string('phone_no', 11)->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('profile_picture_path')->nullable();

            // PRC ID PHOTOS (Front & Back)
            $table->string('prc_id_photo_front')->nullable();
            $table->string('prc_id_photo_back')->nullable();

            $table->string('payslip_photo_path')->nullable();
            $table->string('role', 20)->default('customer')->index();
            $table->string('status', 20)->default('pending');
            $table->dateTime('reviewed_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->dateTime('rejected_at')->nullable();

            $table->rememberToken();
            $table->timestamps();

            $table->foreign('acctno')
                ->references('acctno')
                ->on('wmaster')
                ->cascadeOnUpdate()
                ->noActionOnDelete();

            $table->foreign('reviewed_by')
                ->references('user_id')
                ->on('app_user_table')
                ->onDelete('NO ACTION')
                ->onUpdate('NO ACTION');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_user_table');
    }
};
