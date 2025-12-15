<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use \Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('Amortsched') || !Schema::hasTable('wlnmaster')) {
            return;
        }

        DB::statement("IF OBJECT_ID('dbo.vloandue', 'V') IS NOT NULL DROP VIEW dbo.vloandue;");
        DB::statement('SET ANSI_NULLS ON;');
        DB::statement('SET QUOTED_IDENTIFIER ON;');
        DB::unprepared($this->createOrAlterView());
    }

    private function createOrAlterView(): string
    {
        return <<<SQL
CREATE OR ALTER VIEW dbo.vloandue
AS
SELECT
    m.acctno,
    m.date_end,
    CASE 
        WHEN DATEDIFF(day, m.date_end, GETDATE()) >= 0 
            THEN 'MATURED'
        ELSE 'ACTIVE'
    END AS loan_status
FROM dbo.wlnmaster m
WHERE EXISTS (SELECT 1 FROM dbo.Amortsched WHERE lnnumber = m.lnnumber);
SQL;
    }

    public function down(): void
    {
        DB::statement("IF OBJECT_ID('dbo.vloandue', 'V') IS NOT NULL DROP VIEW dbo.vloandue;");
    }
};
