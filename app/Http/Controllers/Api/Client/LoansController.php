<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Repositories\Client\LoanRepository;
use App\Models\WlnMaster;
use Illuminate\Http\Request;

class LoansController extends Controller
{
    public function __construct(
        private LoanRepository $loanRepository
    ) {}

    /**
     * Get all loans for the authenticated user.
     */
    public function index(Request $request)
    {
        $acctno = $request->user()->acctno ?? null;

        if (!$acctno) {
            return response()->json(['message' => 'Account number (acctno) is required'], 422);
        }

        // Fetch WlnMaster records for this account
        $wlnMasterRecords = WlnMaster::where('acctno', $acctno)
            ->orderBy('lnnumber', 'desc')
            ->get();

        return response()->json([
            'wlnMasterRecords' => $wlnMasterRecords,
        ]);
    }

    /**
     * Get amortization schedule for a specific loan.
     */
    public function getAmortizationSchedule(Request $request, string $lnnumber)
    {
        $acctno = $request->user()->acctno ?? null;

        if (!$acctno) {
            return response()->json(['message' => 'Account number is required'], 422);
        }

        // Verify the loan belongs to the user
        $loan = WlnMaster::where('lnnumber', $lnnumber)
            ->where('acctno', $acctno)
            ->first();

        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }

        $schedule = $this->loanRepository->getAmortizationSchedule($lnnumber);

        return response()->json([
            'schedule' => $schedule,
        ]);
    }

    /**
     * Get ledger entries for a specific loan.
     */
    public function getLedger(Request $request, string $lnnumber)
    {
        $acctno = $request->user()->acctno ?? null;

        if (!$acctno) {
            return response()->json(['message' => 'Account number is required'], 422);
        }

        // Verify the loan belongs to the user
        $loan = WlnMaster::where('lnnumber', $lnnumber)
            ->where('acctno', $acctno)
            ->first();

        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }

        $ledger = $this->loanRepository->getLedgerByLoanNumber($lnnumber);

        return response()->json([
            'ledger' => $ledger,
        ]);
    }
}
