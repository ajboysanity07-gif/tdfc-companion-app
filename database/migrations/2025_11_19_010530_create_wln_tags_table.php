<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
      public function up(): void
    {
        Schema::create('wln_tags', function (Blueprint $table) {
            $table->id();
            $table->string('typecode', 2)->nullable()->index();
            $table->string('tag_name')->index();
            $table->timestamps();

            $table->index(['typecode', 'tag_name']);
        });
    }

    public function down(): void { Schema::dropIfExists('wln_tags'); }
};

