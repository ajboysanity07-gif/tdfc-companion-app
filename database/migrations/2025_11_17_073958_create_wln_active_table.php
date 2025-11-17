<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWlnActiveTable extends Migration
{
    public function up(): void
    {
        Schema::create('wln_active', function (Blueprint $table) {
            $table->id();
            $table->string('typecode', 2)->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('wln_active'); }
}
