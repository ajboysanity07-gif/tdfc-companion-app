<?php

namespace App\Repositories\Client;

use App\Models\VRecentTransactions;
use Illuminate\Support\Collection;

class TransactionsRepository
{
    /**
     * Get recent transactions for an account.
     */
    public function getRecentByAccount(string $acctno): Collection
    {
        return VRecentTransactions::where('acctno', $acctno)
            ->orderByDesc('date_in')
            ->get();
    }
}
