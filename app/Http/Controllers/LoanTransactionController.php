<?php

namespace App\Http\Controllers;

use App\Models\VWebAmortsched;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LoanTransactionController extends Controller
{
    private function num(mixed $v): float
    {
        return is_numeric($v) ? (float) $v : 0.0;
    }

    private function day(mixed $v): ?string
    {
        return $v ? substr((string) $v, 0, 10) : null;
    }

    /** The loan row, only if it belongs to the logged-in user. */
    private function ownLoan(string $lnnumber): ?object
    {
        $acctno = Auth::user()?->acctno;

        return $acctno
            ? DB::table('wlnmaster')->where('acctno', $acctno)->where('lnnumber', $lnnumber)->first()
            : null;
    }

    /**
     * Main page: every loan of the user (paid or not) from wlnmaster.
     */
    public function index(Request $request)
    {
        $acctno = Auth::user()?->acctno;

        $transactions = $acctno
            ? DB::table('wlnmaster')
                ->where('acctno', $acctno)
                ->orderByDesc('date_rel')
                ->get(['lnnumber', 'lntype', 'date_rel', 'principal', 'balance'])
                ->map(fn ($r) => [
                    'lnnumber' => trim((string) $r->lnnumber),
                    'description' => trim((string) $r->lntype),
                    'date' => $this->day($r->date_rel),
                    'principal' => $this->num($r->principal),
                    'raw_balance' => $this->num($r->balance),
                ])
                ->values()
            : [];

        return Inertia::render('loans/transactions', ['transactions' => $transactions]);
    }

    /**
     * Modal: loan summary (wlnmaster) plus its releases and payments (wlnled).
     */
    public function details(Request $request, string $lnnumber): JsonResponse
    {
        $loan = $this->ownLoan($lnnumber);

        if (! $loan) {
            return response()->json(['error' => 'Loan not found'], 404);
        }

        $history = DB::table('wlnled')
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

        return response()->json([
            'loan' => [
                'lnnumber' => trim((string) $loan->lnnumber),
                'description' => trim((string) $loan->lntype),
                'released' => $this->day($loan->date_rel),
                'matures' => $this->day($loan->date_mat),
                'principal' => $this->num($loan->principal),
                'balance' => $this->num($loan->balance),
                'interest_rate' => $this->num($loan->int_rate),
                'installment' => trim((string) $loan->installment),
                'term_months' => $this->num($loan->term_mons),
            ],
            'history' => $history,
        ]);
    }

    /**
     * Modal: amortization schedule for one of the user's loans.
     */
    public function schedule(Request $request, string $lnnumber): JsonResponse
    {
        $loan = $this->ownLoan($lnnumber);

        if (! $loan) {
            return response()->json(['error' => 'Loan not found'], 404);
        }

        $schedule = VWebAmortsched::where('lnnumber', $loan->lnnumber)
            ->orderBy('Date_pay')
            ->get()
            ->map(fn ($item) => [
                'lnnumber' => (string) $item->lnnumber,
                'date' => $item->Date_pay,
                'payPrincipal' => $this->num($item->Principalpay),
                'payInterest' => $this->num($item->Interestm ?? $item->Interest),
                'amortization' => $this->num($item->Amortization),
                'balance' => $this->num($item->Balance),
                'controlno' => (string) ($item->controlno ?? 'N/A'),
            ]);

        return response()->json(['schedule' => $schedule]);
    }
}
