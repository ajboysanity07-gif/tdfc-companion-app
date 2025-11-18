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
            // Add rejection-related columns
            $table->string('rejection_reason')->nullable()->after('status');
            $table->timestamp('rejected_at')->nullable()->after('rejection_reason');
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('rejected_at');
            
            // Foreign key constraint with NO ACTION for SQL Server compatibility
            // This prevents cascade path conflicts when referencing the same table
            $table->foreign('reviewed_by')
                  ->references('user_id')
                  ->on('app_user_table')
                  ->onDelete('NO ACTION')  // Changed from 'set null' to 'NO ACTION'
                  ->onUpdate('NO ACTION'); // Also specify NO ACTION for updates
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_user_table', function (Blueprint $table) {
            // Drop the foreign key first before dropping the column
            $table->dropForeign(['reviewed_by']);
            
            // Drop the columns in reverse order
            $table->dropColumn(['reviewed_by', 'rejected_at', 'rejection_reason']);
        });
    }
};
