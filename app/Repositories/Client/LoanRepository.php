<?php

namespace App\Repositories\Client;

use App\Models\Amortsched;
use App\Models\WlnLed;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class LoanRepository
{
    /**
     * Fetch loan rows grouped by account number.
     */
    public function getLoanRowsGroupedByAccounts(array $acctnos, ?string $connectionName = null): Collection
    {
        if (empty($acctnos)) {
            return collect();
        }

        $connectionName = $connectionName ?? env('LOAN_CLASS_CONNECTION', config('database.default'));
        $loanTable = env('LOAN_CLASS_TABLE', 'vloandue');

        try {
            $rows = DB::connection($connectionName)
                ->table($loanTable)
                ->whereIn('acctno', $acctnos)
                ->get();

            return collect($rows)->groupBy('acctno');
        } catch (\Throwable $e) {
            Log::warning('Unable to batch query loan class data', [
                'connection' => $connectionName,
                'table' => $loanTable,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    /**
     * Get loan ledger entries for a loan number.
     * Filters out rows where both principal=0 AND payment=0
     */
    public function getLedgerByLoanNumber(string $lnnumber): Collection
    {
        $connectionName = (new WlnLed())->getConnectionName() ?? config('database.default');
        $schema = Schema::connection($connectionName);
        $hasLntype = $schema->hasColumn('wlnled', 'lntype');

        $selectColumns = [
            'controlno',
            'lnnumber',
            'date_in',
            'mreference',
            'cs_ck',
            'principal',
            'payments',
            'debit',
            'credit',
            'balance',
            'accruedint',
        ];
        
        if ($hasLntype) {
            $selectColumns[] = 'lntype';
        }

        return WlnLed::query()
            ->where('lnnumber', $lnnumber)
            ->where(function ($query) {
                // Show rows where principal != 0 OR payment != 0
                // Hide rows where principal = 0 AND payment = 0
                $query->whereRaw('CAST(principal AS DECIMAL(18,2)) != 0')
                      ->orWhereRaw('CAST(payments AS DECIMAL(18,2)) != 0');
            })
            ->orderBy('controlno')
            ->get($selectColumns);
    }

    /**
     * Get amortization schedule for a loan number.
     */
    public function getAmortizationSchedule(string $lnnumber, array $columns = ['*']): Collection
    {
        return Amortsched::query()
            ->where('lnnumber', $lnnumber)
            ->orderBy('Date_pay', 'desc')
            ->get($columns);
    }
}
