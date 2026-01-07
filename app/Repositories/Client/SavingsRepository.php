<?php

namespace App\Repositories\Client;

use App\Models\WSavled;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SavingsRepository
{
    /**
     * Get personal savings transactions for an account.
     */
    public function getPersonalSavingsByAccount(string $acctno): Collection
    {
        try {
            return WSavled::where('acctno', $acctno)
                ->where('svtype', WSavled::TYPE_PERSONAL_SAVINGS)
                ->orderBy('date_in', 'desc')
                ->get([
                    'controlno',
                    'svstatus',
                    'acctno',
                    'svnumber',
                    'typecode',
                    'svtype',
                    'date_in',
                    'mreference',
                    'cs_ck',
                    'deposit',
                    'withdrawal',
                    'balance',
                ]);
        } catch (\Throwable $e) {
            Log::warning('Unable to fetch savings data for user', [
                'acctno' => $acctno,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    /**
     * Get savings by type for an account.
     */
    public function getSavingsByType(string $acctno, string $type): Collection
    {
        try {
            return WSavled::where('acctno', $acctno)
                ->where('svtype', $type)
                ->orderBy('date_in', 'desc')
                ->get();
        } catch (\Throwable $e) {
            Log::warning('Unable to fetch savings data for user', [
                'acctno' => $acctno,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }
}
