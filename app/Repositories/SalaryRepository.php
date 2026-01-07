<?php

namespace App\Repositories;

use App\Models\WSalaryRecord;
use Illuminate\Support\Facades\DB;

class SalaryRepository
{
    /**
     * Fetch latest salary records for multiple accounts.
     */
    public function getLatestByAccounts(array $acctnos): \Illuminate\Support\Collection
    {
        if (empty($acctnos)) {
            return collect();
        }

        $latestDates = WSalaryRecord::select('acctno', DB::raw('MAX(created_at) as created_at'))
            ->whereIn('acctno', $acctnos)
            ->groupBy('acctno');

        $rows = WSalaryRecord::joinSub($latestDates, 'latest', function ($join) {
                $join->on('wsalary_records.acctno', '=', 'latest.acctno')
                    ->on('wsalary_records.created_at', '=', 'latest.created_at');
            })
            ->get(['wsalary_records.*']);

        return $rows->keyBy('acctno');
    }

    /**
     * Update or create salary record for an account.
     */
    public function updateOrCreate(string $acctno, float $salaryAmount): WSalaryRecord
    {
        return WSalaryRecord::updateOrCreate(
            ['acctno' => $acctno],
            ['salary_amount' => $salaryAmount]
        );
    }
}
