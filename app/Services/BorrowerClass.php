<?php

namespace App\Services;

use App\Models\AppUser;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BorrowerClass
{
    // Class is detected straight from wlnmaster; only loans still owed (balance > 0) count.
    // Worst loan wins (D > C > B > A); no loans owed = A.
    public static function for(?string $acctno): ?string
    {
        if (! $acctno) {
            return null;
        }

        try {
            $loans = DB::table('wlnmaster')
                ->where('acctno', $acctno)
                ->where('balance', '>', 0)
                ->get(['date_mat', 'date_end']);
        } catch (\Throwable $e) {
            Log::warning('wlnmaster unavailable, skipping client class', ['error' => $e->getMessage()]);
            $loans = collect();
        }

        $now = Carbon::now();
        $worst = $loans->isEmpty() ? 1 : null;

        foreach ($loans as $loan) {
            // Past maturity (what vlnmaster flags as misspayment = 999)
            $matured = isset($loan->date_mat) && Carbon::parse($loan->date_mat)->lte($now);
            $days = isset($loan->date_end) ? Carbon::parse($loan->date_end)->diffInDays($now, false) : null;

            $priority = ! $matured ? 1 : ($days === null ? null : ($days < 60 ? 2 : ($days < 90 ? 3 : 4)));

            if ($priority !== null && ($worst === null || $priority > $worst)) {
                $worst = $priority;
            }
        }

        return $worst ? ['A', 'B', 'C', 'D'][$worst - 1] : null;
    }

    public static function effectiveFor(AppUser $user): ?string
    {
        return $user->manual_borrower_class ?? self::for($user->acctno);
    }
}
