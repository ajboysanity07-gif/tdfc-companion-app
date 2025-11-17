<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWlnDisplayTable extends Migration
{
    public function up(): void
    {
        Schema::create('wln_display', function (Blueprint $table) {
            $table->id();
            $table->string('typecode', 2)->nullable()->index();
            $table->boolean('isDisplayed')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('wln_display'); }
}
