<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add index to sessions table for faster lookups (only if table exists)
        if (Schema::hasTable('sessions') && Schema::hasColumn('sessions', 'user_id')) {
            if (! $this->indexExists('sessions', 'sessions_user_id_index')) {
                DB::statement('CREATE INDEX sessions_user_id_index ON sessions (user_id)');
            }
        }

        if (Schema::hasTable('sessions') && Schema::hasColumn('sessions', 'last_activity')) {
            if (! $this->indexExists('sessions', 'sessions_last_activity_index')) {
                DB::statement('CREATE INDEX sessions_last_activity_index ON sessions (last_activity)');
            }
        }

        // Add indexes to cache table (column is 'expiration' not 'expires_at')
        if (Schema::hasTable('cache') && Schema::hasColumn('cache', 'expiration')) {
            if (! $this->indexExists('cache', 'cache_expiration_index')) {
                DB::statement('CREATE INDEX cache_expiration_index ON cache (expiration)');
            }
        }

        // Add indexes to jobs table for queue performance
        if (Schema::hasTable('jobs')) {
            if (Schema::hasColumn('jobs', 'queue') && Schema::hasColumn('jobs', 'reserved_at')) {
                if (! $this->indexExists('jobs', 'jobs_queue_index')) {
                    DB::statement('CREATE INDEX jobs_queue_index ON jobs (queue, reserved_at)');
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sessions')) {
            DB::statement('DROP INDEX IF EXISTS sessions_user_id_index ON sessions');
            DB::statement('DROP INDEX IF EXISTS sessions_last_activity_index ON sessions');
        }

        if (Schema::hasTable('cache')) {
            DB::statement('DROP INDEX IF EXISTS cache_expiration_index ON cache');
        }

        if (Schema::hasTable('jobs')) {
            DB::statement('DROP INDEX IF EXISTS jobs_queue_index ON jobs');
        }
    }

    /**
     * Check if an index exists on a table (SQL Server compatible).
     */
    private function indexExists(string $table, string $index): bool
    {
        $result = DB::select('
            SELECT COUNT(*) as count 
            FROM sys.indexes 
            WHERE name = ? 
            AND object_id = OBJECT_ID(?)
        ', [$index, $table]);

        return $result[0]->count > 0;
    }
};
