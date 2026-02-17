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
        // Add indexes to app_user_table for faster lookups
        if (Schema::hasTable('app_user_table')) {
            // Email is used for login - most important
            if (Schema::hasColumn('app_user_table', 'email') && ! $this->indexExists('app_user_table', 'app_user_email_index')) {
                DB::statement('CREATE INDEX app_user_email_index ON app_user_table (email)');
            }

            // Acctno for linking with wmaster
            if (Schema::hasColumn('app_user_table', 'acctno') && ! $this->indexExists('app_user_table', 'app_user_acctno_index')) {
                DB::statement('CREATE INDEX app_user_acctno_index ON app_user_table (acctno)');
            }

            // Phone number for lookups
            if (Schema::hasColumn('app_user_table', 'phone_no') && ! $this->indexExists('app_user_table', 'app_user_phone_index')) {
                DB::statement('CREATE INDEX app_user_phone_index ON app_user_table (phone_no)');
            }

            // Status for filtering active/inactive users
            if (Schema::hasColumn('app_user_table', 'status') && ! $this->indexExists('app_user_table', 'app_user_status_index')) {
                DB::statement('CREATE INDEX app_user_status_index ON app_user_table (status)');
            }

            // Role for permission checks
            if (Schema::hasColumn('app_user_table', 'role') && ! $this->indexExists('app_user_table', 'app_user_role_index')) {
                DB::statement('CREATE INDEX app_user_role_index ON app_user_table (role)');
            }
        }

        // Add indexes to wmaster for faster member lookups
        if (Schema::hasTable('wmaster')) {
            // Acctno is primary identifier
            if (Schema::hasColumn('wmaster', 'acctno') && ! $this->indexExists('wmaster', 'wmaster_acctno_index')) {
                DB::statement('CREATE INDEX wmaster_acctno_index ON wmaster (acctno)');
            }

            // Email for user account linking
            if (Schema::hasColumn('wmaster', 'email_address') && ! $this->indexExists('wmaster', 'wmaster_email_index')) {
                DB::statement('CREATE INDEX wmaster_email_index ON wmaster (email_address)');
            }

            // Last name for name searches
            if (Schema::hasColumn('wmaster', 'lname') && ! $this->indexExists('wmaster', 'wmaster_lname_index')) {
                DB::statement('CREATE INDEX wmaster_lname_index ON wmaster (lname)');
            }

            // Member type for filtering
            if (Schema::hasColumn('wmaster', 'memtype') && ! $this->indexExists('wmaster', 'wmaster_memtype_index')) {
                DB::statement('CREATE INDEX wmaster_memtype_index ON wmaster (memtype)');
            }

            // Date membership for sorting/filtering
            if (Schema::hasColumn('wmaster', 'datemem') && ! $this->indexExists('wmaster', 'wmaster_datemem_index')) {
                DB::statement('CREATE INDEX wmaster_datemem_index ON wmaster (datemem)');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('app_user_table')) {
            DB::statement('DROP INDEX IF EXISTS app_user_email_index ON app_user_table');
            DB::statement('DROP INDEX IF EXISTS app_user_acctno_index ON app_user_table');
            DB::statement('DROP INDEX IF EXISTS app_user_phone_index ON app_user_table');
            DB::statement('DROP INDEX IF EXISTS app_user_status_index ON app_user_table');
            DB::statement('DROP INDEX IF EXISTS app_user_role_index ON app_user_table');
        }

        if (Schema::hasTable('wmaster')) {
            DB::statement('DROP INDEX IF EXISTS wmaster_acctno_index ON wmaster');
            DB::statement('DROP INDEX IF EXISTS wmaster_email_index ON wmaster');
            DB::statement('DROP INDEX IF EXISTS wmaster_lname_index ON wmaster');
            DB::statement('DROP INDEX IF EXISTS wmaster_memtype_index ON wmaster');
            DB::statement('DROP INDEX IF EXISTS wmaster_datemem_index ON wmaster');
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
