<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_user_table', function (Blueprint $table) {
            $table->string('manual_borrower_class', 1)->nullable()->after('status');
        });

        Schema::create('borrower_class_overrides', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('previous_override_class', 1)->nullable();
            $table->string('new_override_class', 1)->nullable();
            $table->string('detected_class', 1)->nullable();
            $table->text('reason');
            $table->unsignedBigInteger('changed_by')->index();
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('app_user_table')->noActionOnDelete();
            $table->foreign('changed_by')->references('user_id')->on('app_user_table')->noActionOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrower_class_overrides');

        Schema::table('app_user_table', function (Blueprint $table) {
            $table->dropColumn('manual_borrower_class');
        });
    }
};
