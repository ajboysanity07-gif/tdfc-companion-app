<?php

namespace App\Http\Controllers;

use App\Models\AppUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SavingsController extends Controller
{
    /** Savings ledger of the member (wsavled), newest first. */
    public function index(Request $request)
    {
        $acctno = AppUser::subject($request)?->acctno;
        $num = fn ($v) => is_numeric($v) ? (float) $v : 0.0;

        $transactions = $acctno
            ? DB::table('wsavled')
                ->where('acctno', $acctno)
                ->orderByDesc('date_in')
                ->orderByDesc('controlno')
                ->get(['svnumber', 'svtype', 'date_in', 'mreference', 'deposit', 'withdrawal', 'balance', 'controlno'])
                ->map(fn ($r) => [
                    'key' => trim((string) $r->svnumber).'-'.trim((string) $r->controlno),
                    'svnumber' => trim((string) $r->svnumber),
                    'description' => trim((string) $r->svtype),
                    'date' => $r->date_in ? substr((string) $r->date_in, 0, 10) : null,
                    'reference' => trim((string) $r->mreference),
                    'deposit' => $num($r->deposit),
                    'withdrawal' => $num($r->withdrawal),
                    'raw_balance' => $num($r->balance),
                ])
                // Same rule as the dashboard: skip rows that move no money.
                ->filter(fn ($r) => $r['deposit'] > 0 || $r['withdrawal'] > 0)
                ->values()
            : [];

        return Inertia::render('savings/transactions', ['transactions' => $transactions] + AppUser::adminViewProps($request));
    }
}
