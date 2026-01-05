<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VRecentTransactions;
use App\Models\WSavled;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ClientDashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $acctno = $request->user()->acctno ?? null;

        if (!$acctno) {
            return response()->json(['message' => 'Account number (acctno) is required'], 422);
        }

        $transactions = VRecentTransactions::where('acctno', $acctno)
            ->orderByDesc('date_in')
            ->get();

        // Fetch loan class for logged-in user
        $loanClass = $this->determineLoanClassForUser($acctno);

        // Fetch personal savings for logged-in user
        $savings = $this->fetchSavings($acctno);

        return response()->json([
            'items' => $transactions,
            'loanClass' => $loanClass,
            'savings' => $savings,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Determine loan class for the logged-in user
     */
    protected function determineLoanClassForUser(string $acctno): ?string
    {
        $loanRows = $this->fetchLoanRowsForUser($acctno);
        return $this->determineLoanClassFromRows($loanRows);
    }

    /**
     * Fetch loan rows from vloandue for a specific user account
     */
    protected function fetchLoanRowsForUser(string $acctno)
    {
        $connectionName = env('LOAN_CLASS_CONNECTION', config('database.default'));
        $loanTable = env('LOAN_CLASS_TABLE', 'vloandue');

        try {
            return DB::connection($connectionName)
                ->table($loanTable)
                ->where('acctno', $acctno)
                ->get();
        } catch (\Throwable $e) {
            Log::warning('Unable to fetch loan class data for user', [
                'acctno' => $acctno,
                'connection' => $connectionName,
                'table' => $loanTable,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    /**
     * Determine loan class from loan rows
     * Follows the same logic as ClientManagementController
     */
    protected function determineLoanClassFromRows($loanRows): ?string
    {
        if (!$loanRows || count($loanRows) === 0) {
            return null;
        }

        $highest = null;
        foreach ($loanRows as $loanData) {
            $loanStatus = $loanData->loan_status ?? null;
            $dateEnd = isset($loanData->date_end) ? Carbon::parse($loanData->date_end) : null;
            $diffDays = $dateEnd ? Carbon::parse($loanData->date_end)->diffInDays(now(), false) : null;
            $prio = null;

            if ($loanStatus !== 'MATURED') {
                $prio = 1;
            } elseif ($diffDays !== null && $diffDays > 0) {
                $prio = $diffDays < 60 ? 2 : ($diffDays < 90 ? 3 : 4);
            }

            if ($prio !== null && ($highest === null || $prio > $highest)) {
                $highest = $prio;
            }
        }

        $highest = $highest ?? 4;
        return match ($highest) {
            1 => 'A',
            2 => 'B',
            3 => 'C',
            4 => 'D',
            default => null,
        };
    }

    /**
     * Fetch personal savings data for a user
     */
    protected function fetchSavings(string $acctno)
    {
        try {
            return WSavled::where('acctno', $acctno)
                ->where('svtype', 'PERSONAL SAVINGS')
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
                ])
                ->map(function ($row) {
                    return [
                        'controlno' => (string) $row->controlno,
                        'svstatus' => (string) ($row->svstatus ?? ''),
                        'acctno' => (string) $row->acctno,
                        'svnumber' => (string) $row->svnumber,
                        'typecode' => (string) ($row->typecode ?? ''),
                        'svtype' => (string) ($row->svtype ?? ''),
                        'date_in' => $row->date_in ? (new Carbon($row->date_in))->toISOString() : null,
                        'mreference' => (string) ($row->mreference ?? ''),
                        'cs_ck' => (string) ($row->cs_ck ?? ''),
                        'deposit' => is_numeric($row->deposit) ? (float) $row->deposit : 0.0,
                        'withdrawal' => is_numeric($row->withdrawal) ? (float) $row->withdrawal : 0.0,
                        'balance' => is_numeric($row->balance) ? (float) $row->balance : 0.0,
                    ];
                })
                ->values();
        } catch (\Throwable $e) {
            Log::warning('Unable to fetch savings data for user', [
                'acctno' => $acctno,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }
}
