<?php

// namespace App\Http\Controllers;

// use App\Models\VWebAccount;
// use Illuminate\Http\JsonResponse;
// use Illuminate\Support\Facades\Auth;

// class TransactionController extends Controller
// {
//     /**
//      * Recent transactions for the current user (JSON),
//      * formatted for the dashboard DataTable.
//      */
//     public function recent(): JsonResponse
//     {
//         $acctno = Auth::user()?->acctno;

//         if (!$acctno) {
//             return response()->json(['items' => []]);
//         }

//         // Pull latest 10 by release date
//         $rows = VWebAccount::query()
//             ->where('acctno', $acctno)
//             ->orderByDesc('daterel')
//             ->take(10)
//             ->get([
//                     'acctno',
//                     'lnnumber',
//                     'lntype',
//                     'balance',
//                     'daterel',
//                     'datemat',
//                     'principal',
//                     'term_days',
//             ])
//             ->map(function ($r) {
//                 // Compute (principal - balance), guard nulls
//                 $principal = is_numeric($r->principal) ? (float)$r->principal : 0.0;
//                 $bal       = is_numeric($r->balance)   ? (float)$r->balance   : 0.0;

//                 return [
//                     'description' => (string) $r->lntype,
//                     'date'        => $r->daterel,              // ISO-ish from SQL Server
//                     'balance'     => $principal - $bal,        // computed
//                 ];
//             })
//             ->values();

//         return response()->json(['items' => $rows]);
//     }

//     /**
//      * (Optional for later) Full listing / server-side pagination could go here.
//      * Keeping it empty now since you’ll reuse this controller elsewhere.
//      */
//     public function index(): JsonResponse
//     {
//         return response()->json(['items' => []]);
//     }
// }

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VWeb_Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RecentTransactionController extends Controller
{
    /**
     * Return recent transactions for the current user as JSON.
     * Each item includes:
     *  - description (lntype)
     *  - date        (daterel)
     *  - principal   (as numeric)
     *  - raw_balance (as numeric; original view's balance)
     *
     * The React view computes Amount = principal - raw_balance.
     */
    public function recent(): JsonResponse
    {
        $acctno = Auth::user()?->acctno;

        if (!$acctno) {
            return response()->json(['items' => []]);
        }

        $rows = VWeb_Account::query()
            ->where('acctno', $acctno)
            ->orderByDesc('daterel')
            ->take(10)
            ->get([
                'lnnumber',   // ⬅️ include
                'lntype',
                'daterel',
                'principal',
                'balance'
            ])
            ->map(static function (VWeb_Account $r): array {
                return [
                    'lnnumber'    => (string) $r->lnnumber,                   // ⬅️ include
                    'description' => (string) $r->lntype,
                    'date'        => $r->daterel,
                    'principal'   => is_numeric($r->principal) ? (float) $r->principal : 0.0,
                    'raw_balance' => is_numeric($r->balance)   ? (float) $r->balance   : 0.0,
                ];
            })
            ->values();

        return response()->json(['items' => $rows]);
    }

    /**
     * Placeholder for a full, server-side paginated list later.
     */
    public function index(): JsonResponse
    {
        return response()->json(['items' => []]);
    }
}
