<?php

namespace App\Http\Controllers;

use App\Models\VWeb_Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RecentTransactionController extends Controller
{
    /**
     * Return recent transactions for the current user as JSON.
     *
     * Response shape:
     * [
     *     'items' => [
     *         [
     *             'lnnumber' => string,
     *             'description' => string,
     *             'date' => mixed,
     *             'principal' => float,
     *             'raw_balance' => float,
     *         ],
     *     ],
     * ]
     */
    public function recent(): JsonResponse
    {
        $acctno = Auth::user()?->acctno;

        if (! $acctno) {
            return response()->json(['items' => []]);
        }

        try {
            $rows = VWeb_Account::query()
                ->where('acctno', $acctno)
                ->orderByDesc('date_in')
                ->take(10)
                ->get([
                    'ln_sv_number',
                    'transaction_type',
                    'date_in',
                    'principal',
                    'balance',
                ])
                ->map(static function (VWeb_Account $row): array {
                    return [
                        'lnnumber' => (string) $row->ln_sv_number,
                        'description' => (string) $row->transaction_type,
                        'date' => $row->date_in,
                        'principal' => is_numeric($row->principal) ? (float) $row->principal : 0.0,
                        'raw_balance' => is_numeric($row->balance) ? (float) $row->balance : 0.0,
                    ];
                })
                ->values();

            return response()->json(['items' => $rows]);
        } catch (\Throwable $exception) {
            Log::error('Failed to load recent transactions', [
                'acctno' => $acctno,
                'exception_class' => $exception::class,
                'exception_message' => $exception->getMessage(),
            ]);

            return response()->json(['items' => []]);
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
