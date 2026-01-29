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
        // Add index to sessions table for faster lookups
        Schema::table('sessions', function (Blueprint $table) {
            if (!$this->hasIndex('sessions', 'sessions_user_id_index')) {
                $table->index('user_id', 'sessions_user_id_index');
            }
            if (!$this->hasIndex('sessions', 'sessions_last_activity_index')) {
                $table->index('last_activity', 'sessions_last_activity_index');
            }
        });

        // Add indexes to cache table
        Schema::table('cache', function (Blueprint $table) {
            if (!$this->hasIndex('cache', 'cache_expires_at_index')) {
                $table->index('expires_at', 'cache_expires_at_index');
            }
        });

        // Add indexes to jobs table for queue performance
        if (Schema::hasTable('jobs')) {
            Schema::table('jobs', function (Blueprint $table) {
                if (!$this->hasIndex('jobs', 'jobs_queue_index')) {
                    $table->index(['queue', 'reserved_at'], 'jobs_queue_index');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropIndex('sessions_user_id_index');
            $table->dropIndex('sessions_last_activity_index');
        });

        Schema::table('cache', function (Blueprint $table) {
            $table->dropIndex('cache_expires_at_index');
        });

        if (Schema::hasTable('jobs')) {
            Schema::table('jobs', function (Blueprint $table) {
                $table->dropIndex('jobs_queue_index');
            });
        }
    }

    /**
     * Check if an index exists on a table.
     */
    private function hasIndex(string $table, string $index): bool
    {
        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $indexes = $sm->listTableIndexes($table);
        return isset($indexes[$index]);
    }
};
