<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            CREATE VIEW vRecentTransactions
            AS
            SELECT TOP (100) PERCENT
                acctno,
                'LN' + lnnumber AS ln_sv_number,
                date_in,
                lntype AS transaction_type,
                principal AS amount,
                payments AS movement,
                balance,
                'LOAN' AS source,
                principal,
                NULL AS deposit,
                NULL AS withdrawal,
                payments,
                debit
                
            FROM wlnled

            UNION ALL

            SELECT TOP (100) PERCENT
                acctno,
                'SV' + svnumber AS ln_sv_number,
                date_in,
                svtype AS transaction_type,
                deposit AS amount,
                withdrawal AS movement,
                balance,
                'SAV' AS source,
                NULL AS principal,
                deposit,
                withdrawal,
                NULL AS payments,
                NULL AS debit
                
            FROM wsavled
            ORDER BY date_in DESC
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS vRecentTransactions");
    }
};
