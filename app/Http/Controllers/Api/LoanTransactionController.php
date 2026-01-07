<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VWeb_Account;
use App\Models\VWebLnled;
use App\Models\VWebAmortsched;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoanTransactionController extends Controller
{
    /**
     * ✅ MAIN PAGE: Load only essential table data
     */
public function index(Request $request)
    {
        $user = Auth::user();
        $acctno = $user?->acctno;

        if (!$acctno) {
            return Inertia::render('loans/transactions', [
                'transactions' => []
            ]);
        }

        // ✅ ADDED: Filter to only show transactions starting with 'LN'
        $transactions = VWeb_Account::query()
            ->where('acctno', $acctno)
            ->where('lnnumber', 'like', 'LN%') // ✅ This filters loan numbers starting with 'LN'
            ->orderByDesc('daterel')
            ->get(['lnnumber', 'lntype', 'daterel', 'principal', 'balance'])
            ->map(function ($r) {
                return [
                    'lnnumber'    => (string) $r->lnnumber,
                    'description' => (string) $r->lntype,
                    'date'        => $r->daterel,
                    'principal'   => is_numeric($r->principal) ? (float) $r->principal : 0.0,
                    'raw_balance' => is_numeric($r->balance) ? (float) $r->balance : 0.0,
                ];
            });

        return Inertia::render('loans/transactions', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * ✅ API ENDPOINT: Transaction details for modal
     */
    public function details(Request $request, string $lnnumber): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->acctno) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $transaction = VWebLnled::where('lnnumber', $lnnumber)->first();
        
        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        return response()->json([
            'transaction' => [
                'lnnumber' => (string) $transaction->lnnumber,
                'reference' => (string) ($transaction->mreference ?? 'N/A'),
                'transactionCode' => (string) ($transaction->cs_ck ?? 'N/A'),
                'principal' => is_numeric($transaction->principal) ? (float) $transaction->principal : 0.0,
                'payment' => is_numeric($transaction->payments) ? (float) $transaction->payments : 0.0,
                'balance' => is_numeric($transaction->balance) ? (float) $transaction->balance : 0.0,
                'charges' => (is_numeric($transaction->debit) ? (float) $transaction->debit : 0.0) - 
                           (is_numeric($transaction->credit) ? (float) $transaction->credit : 0.0),
                'controlno' => (string) ($transaction->controlno ?? 'N/A'),
            ]
        ]);
    }

    /**
     * ✅ UPDATED: API endpoint for amortization schedule using lnnumber
     */
    public function schedule(Request $request, string $lnnumber): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->acctno) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // ✅ CHANGED: Now using lnnumber instead of controlno
        $schedule = VWebAmortsched::where('lnnumber', $lnnumber)
            ->orderBy('Date_pay')
            ->get()
            ->map(function ($item) {
                return [
                    'lnnumber' => (string) $item->lnnumber,  // ✅ Include lnnumber
                    'date' => $item->Date_pay,
                    'payPrincipal' => is_numeric($item->Principalpay) ? (float) $item->Principalpay : 0.0,
                    'payInterest' => is_numeric($item->Interestm) ? (float) $item->Interestm : 0.0,
                    'amortization' => is_numeric($item->Amortization) ? (float) $item->Amortization : 0.0,
                    'balance' => is_numeric($item->Balance) ? (float) $item->Balance : 0.0,
                    'controlno' => (string) ($item->controlno ?? 'N/A'), // ✅ Keep controlno if needed
                ];
            });

        return response()->json(['schedule' => $schedule]);
    }
}
