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
        Schema::create('wln_tag_summary', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wlntag_id')->index();
            $table->foreign('wlntag_id')->references('id')->on('wln_tags')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('wln_tag_summary'); }
};
