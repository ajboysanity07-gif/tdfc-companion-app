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
        Schema::table('app_user_table', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('app_user_table', 'reviewed_at')) {
                $table->dateTime('reviewed_at')->nullable()->after('status');
            }
            
            if (!Schema::hasColumn('app_user_table', 'reviewed_by')) {
                $table->unsignedBigInteger('reviewed_by')->nullable()->after('reviewed_at');
            }
            
            if (!Schema::hasColumn('app_user_table', 'rejected_at')) {
                $table->dateTime('rejected_at')->nullable()->after('reviewed_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_user_table', function (Blueprint $table) {
            $table->dropColumn(['reviewed_at', 'reviewed_by', 'rejected_at']);
        });
    }
};
