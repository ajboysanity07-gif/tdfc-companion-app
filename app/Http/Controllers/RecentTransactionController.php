<?php

namespace App\Http\Controllers;

use App\Models\AppUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecentTransactionController extends Controller
{
    /**
     * Account summaries for the current user plus every transaction they made.
     *
     * - items: one row per loan (wlnmaster, "LN" prefix) and per savings account
     *   (latest wsavled balance, "SV" prefix). Dashboard stats and the calculator read these.
     * - dues: next unpaid installment per active loan (Amortsched + wlnmaster), earliest first.
     * - transactions: loan releases/payments (wlnled) and deposits/withdrawals (wsavled), newest first.
     */
    public function recent(Request $request): JsonResponse
    {
        $acctno = AppUser::subject($request)?->acctno;

        if (! $acctno) {
            return response()->json(['items' => [], 'transactions' => [], 'dues' => []]);
        }

        try {
            $num = static fn ($v): float => is_numeric($v) ? (float) $v : 0.0;
            $day = static fn ($v): ?string => $v ? substr((string) $v, 0, 10) : null;

            $loans = DB::table('wlnmaster')
                ->where('acctno', $acctno)
                ->where('balance', '<>', 0) // only loans still owed, same rule as VWeb_Account
                ->orderByDesc('date_rel')
                ->get(['lnnumber', 'lntype', 'date_rel', 'principal', 'balance'])
                ->map(fn ($r) => [
                    'lnnumber' => 'LN'.trim((string) $r->lnnumber),
                    'description' => trim((string) $r->lntype),
                    'date' => $day($r->date_rel),
                    'principal' => $num($r->principal),
                    'raw_balance' => $num($r->balance),
                ]);

            $savingsLedger = DB::table('wsavled')
                ->where('acctno', $acctno)
                ->orderByDesc('date_in')
                ->orderByDesc('controlno')
                ->get(['svnumber', 'svtype', 'typecode', 'date_in', 'mreference', 'deposit', 'withdrawal', 'balance', 'controlno']);

            // Personal savings (typecode 04, as in VWeb_Account): latest row = current balance (rows are newest first).
            $savings = $savingsLedger->where('typecode', '04')->unique('svnumber')->map(fn ($r) => [
                'lnnumber' => 'SV'.trim((string) $r->svnumber),
                'description' => trim((string) $r->svtype),
                'date' => $day($r->date_in),
                'principal' => $num($r->balance),
                'raw_balance' => $num($r->balance),
            ]);

            $loanLedger = DB::table('wlnled')
                ->where('acctno', $acctno)
                ->whereIn('lncode', ['RL', 'LN'])
                ->get(['lnnumber', 'lntype', 'date_in', 'mreference', 'lncode', 'principal', 'payments', 'balance', 'controlno']);

            $transactions = collect();

            foreach ($loanLedger as $r) {
                $ref = trim((string) $r->mreference);
                if ($r->lncode === 'RL') {
                    $label = 'Loan Release';
                    $amount = $num($r->principal);
                } elseif ($num($r->payments) > 0 && stripos($ref, 'loan release') !== 0) {
                    $label = 'Loan Payment';
                    $amount = -$num($r->payments);
                } else {
                    continue; // release counter-entry / zero rows
                }
                $transactions->push([
                    'kind' => 'loan',
                    'ref' => trim((string) $r->lnnumber),
                    'description' => trim((string) $r->lntype).' · '.$label,
                    'date' => $day($r->date_in),
                    'amount' => $amount,
                    'balance' => $num($r->balance),
                    'sort' => $day($r->date_in).sprintf('%012d', (int) $r->controlno),
                ]);
            }

            foreach ($savingsLedger as $r) {
                $dep = $num($r->deposit);
                $wd = $num($r->withdrawal);
                if ($dep <= 0 && $wd <= 0) {
                    continue;
                }
                $transactions->push([
                    'kind' => 'savings',
                    'ref' => trim((string) $r->svnumber),
                    'description' => trim((string) $r->svtype).' · '.($dep > 0 ? 'Deposit' : 'Withdrawal'),
                    'date' => $day($r->date_in),
                    'amount' => $dep > 0 ? $dep : -$wd,
                    'balance' => $num($r->balance),
                    'sort' => $day($r->date_in).sprintf('%012d', (int) $r->controlno),
                ]);
            }

            $transactions = $transactions
                ->sortByDesc('sort')
                ->map(fn ($t) => array_diff_key($t, ['sort' => 1]))
                ->values();

            // Next installment per active loan: the earliest Amortsched row whose scheduled balance is
            // below the loan's actual balance (not yet paid; same test vlnmaster uses for missed payments).
            // Amount due = Amortization (principal) + Interest, like VWeb_Amortsched.
            $names = $loans->pluck('description', 'lnnumber');
            $dues = collect(DB::select(
                'select lnnumber, Date_pay, due from (
                    select a.lnnumber, a.Date_pay, a.Amortization + a.Interest as due,
                           row_number() over (partition by a.lnnumber order by a.Date_pay) as rn
                    from Amortsched a
                    join wlnmaster w on w.lnnumber = a.lnnumber
                    where w.acctno = ? and w.balance <> 0 and a.Balance < w.balance
                ) x where rn = 1',
                [$acctno]
            ))->map(fn ($r) => [
                'lnnumber' => 'LN'.trim((string) $r->lnnumber),
                'description' => $names['LN'.trim((string) $r->lnnumber)] ?? '',
                'date' => $day($r->Date_pay),
                'amount' => $num($r->due),
            ])->sortBy('date')->values();

            return response()->json([
                'items' => $loans->concat($savings)->values(),
                'transactions' => $transactions,
                'dues' => $dues,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Failed to load recent transactions', [
                'acctno' => $acctno,
                'exception_class' => $exception::class,
                'exception_message' => $exception->getMessage(),
            ]);

            return response()->json(['items' => [], 'transactions' => [], 'dues' => []]);
        }
    }

    /**
     * Placeholder for future server-side listing.
     */
    public function index(): JsonResponse
    {
        return response()->json(['items' => []]);
    }
}
