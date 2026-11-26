<?php

namespace App\Http\Controllers;

use App\Models\AppUser;
use App\Models\VWebAmortsched;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LoanTransactionController extends Controller
{
    private function num(mixed $v): float
    {
        return is_numeric($v) ? (float) $v : 0.0;
    }

    /** ISO date. Parsed, not cut: VWeb_Amortsched returns Date_pay as MM/DD/YYYY text. */
    private function day(mixed $v): ?string
    {
        return $v ? Carbon::parse((string) $v)->toDateString() : null;
    }

    /** The loan row, only if it belongs to the logged-in user. */
    private function ownLoan(string $lnnumber): ?object
    {
        $acctno = AppUser::subject(request())?->acctno;

        return $acctno
            ? DB::table('wlnmaster')->where('acctno', $acctno)->where('lnnumber', $lnnumber)->first()
            : null;
    }

    /**
     * Main page: every loan of the user (paid or not) from wlnmaster.
     */
    public function index(Request $request)
    {
        $acctno = AppUser::subject($request)?->acctno;

        $loans = $acctno
            ? DB::table('wlnmaster')
                ->where('acctno', $acctno)
                ->orderByDesc('date_rel')
                ->get(['lnnumber', 'lntype', 'date_rel', 'principal', 'balance'])
            : collect();

        // Next installment per active loan: first schedule row whose balance is below what is still owed.
        $owed = $loans->filter(fn ($r) => $this->num($r->balance) > 0)->mapWithKeys(fn ($r) => [$r->lnnumber => $this->num($r->balance)]);
        $next = $owed->isEmpty() ? collect() : VWebAmortsched::whereIn('lnnumber', $owed->keys())
            ->get()
            ->sortBy(fn ($i) => $this->day($i->Date_pay))
            ->groupBy('lnnumber')
            ->map(fn ($rows, $ln) => $rows->first(fn ($i) => $this->num($i->Balance) < $owed[$ln]))
            ->filter();

        $transactions = $loans->map(fn ($r) => [
            'lnnumber' => trim((string) $r->lnnumber),
            'description' => trim((string) $r->lntype),
            'date' => $this->day($r->date_rel),
            'principal' => $this->num($r->principal),
            'raw_balance' => $this->num($r->balance),
            'next_due' => ($n = $next->get($r->lnnumber)) ? ['date' => $this->day($n->Date_pay), 'amount' => $this->num($n->Amortization)] : null,
        ])->values();

        return Inertia::render('loans/transactions', ['transactions' => $transactions] + AppUser::adminViewProps($request));
    }

    /**
     * Detail page: KPIs, loan summary, history (wlnled) and schedule (Amortsched) of one loan.
     */
    public function show(Request $request)
    {
        // Read by name: on admin routes {user} comes first and would be passed positionally as $lnnumber.
        $loan = $this->ownLoan((string) $request->route('lnnumber'));
        abort_unless($loan, 404);

        return Inertia::render('loans/transaction-show', [
            'tab' => $request->query('tab') === 'schedule' ? 'schedule' : 'details',
            'loan' => $this->summary($loan),
            'history' => $this->history($loan),
            'schedule' => $this->scheduleRows($loan),
        ] + AppUser::adminViewProps($request));
    }

    private function summary(object $loan): array
    {
        return [
            'lnnumber' => trim((string) $loan->lnnumber),
            'description' => trim((string) $loan->lntype),
            'released' => $this->day($loan->date_rel),
            'matures' => $this->day($loan->date_mat),
            'principal' => $this->num($loan->principal),
            'balance' => $this->num($loan->balance),
            'interest_rate' => $this->num($loan->int_rate),
            'installment' => trim((string) $loan->installment),
            'term_months' => $this->num($loan->term_mons),
        ];
    }

    /** Releases and payments from wlnled, newest first. */
    private function history(object $loan): Collection
    {
        return DB::table('wlnled')
            ->where('lnnumber', $loan->lnnumber)
            ->whereIn('lncode', ['RL', 'LN'])
            ->orderByDesc('date_in')
            ->orderByDesc('controlno')
            ->get(['date_in', 'mreference', 'lncode', 'principal', 'payments', 'balance', 'controlno'])
            ->map(function ($r) {
                $ref = trim((string) $r->mreference);
                if ($r->lncode === 'RL') {
                    $label = 'Loan Release';
                    $amount = $this->num($r->principal);
                } elseif ($this->num($r->payments) > 0 && stripos($ref, 'loan release') !== 0) {
                    $label = 'Loan Payment';
                    $amount = -$this->num($r->payments);
                } else {
                    return null; // release counter-entry, accruals, zero rows
                }

                return [
                    'date' => $this->day($r->date_in),
                    'description' => $label,
                    'reference' => $ref,
                    'amount' => $amount,
                    'balance' => $this->num($r->balance),
                    'controlno' => trim((string) $r->controlno),
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * Amortization schedule with a status per row. Same rule as the dashboard's next payment:
     * a row is unpaid while its scheduled balance is below the loan's actual balance.
     */
    private function scheduleRows(object $loan): Collection
    {
        $owed = $this->num($loan->balance);
        $nextFound = false;

        return VWebAmortsched::where('lnnumber', $loan->lnnumber)
            ->get()
            ->sortBy(fn ($i) => $this->day($i->Date_pay))
            ->map(function ($item) use ($owed, &$nextFound) {
                $balance = $this->num($item->Balance);
                if ($owed <= 0 || $balance >= $owed) {
                    $status = 'paid';
                } elseif (! $nextFound) {
                    $nextFound = true;
                    $status = 'due';
                } else {
                    $status = 'upcoming';
                }

                return [
                    'date' => $this->day($item->Date_pay),
                    'payPrincipal' => $this->num($item->Principalpay),
                    'payInterest' => $this->num($item->Interestm ?? $item->Interest),
                    'amortization' => $this->num($item->Amortization),
                    'balance' => $balance,
                    'status' => $status,
                ];
            })
            ->values();
    }

    /** JSON: loan summary plus history. */
    public function details(Request $request, string $lnnumber): JsonResponse
    {
        $loan = $this->ownLoan($lnnumber);

        if (! $loan) {
            return response()->json(['error' => 'Loan not found'], 404);
        }

        return response()->json(['loan' => $this->summary($loan), 'history' => $this->history($loan)]);
    }

    /** JSON: amortization schedule. */
    public function schedule(Request $request, string $lnnumber): JsonResponse
    {
        $loan = $this->ownLoan($lnnumber);

        if (! $loan) {
            return response()->json(['error' => 'Loan not found'], 404);
        }

        return response()->json(['schedule' => $this->scheduleRows($loan)]);
    }
}
