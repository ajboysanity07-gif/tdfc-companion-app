<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wln_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('wln_settings', 'installment_mode')) {
                $table->string('installment_mode')->default('MONTHLY');
            }
            if (!Schema::hasColumn('wln_settings', 'rate_isEditable')) {
                $table->boolean('rate_isEditable')->default(false);
            }
            if (!Schema::hasColumn('wln_settings', 'allow_multiple')) {
                $table->boolean('allow_multiple')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('wln_settings', function (Blueprint $table) {
            $table->dropColumn(['installment_mode', 'rate_isEditable', 'allow_multiple']);
        });
    }
};
