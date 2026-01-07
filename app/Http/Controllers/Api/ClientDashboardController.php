<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SavingsResource;
use App\Http\Resources\TransactionResource;
use App\Repositories\LoanRepository;
use App\Repositories\SavingsRepository;
use App\Repositories\TransactionsRepository;
use App\Services\LoanClassificationService;
use Illuminate\Http\Request;

class ClientDashboardController extends Controller
{
    public function __construct(
        private TransactionsRepository $transactionsRepository,
        private LoanRepository $loanRepository,
        private SavingsRepository $savingsRepository,
        private LoanClassificationService $loanClassificationService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $acctno = $request->user()->acctno ?? null;

        if (!$acctno) {
            return response()->json(['message' => 'Account number (acctno) is required'], 422);
        }

        $transactions = $this->transactionsRepository->getRecentByAccount($acctno);
        $loanClass = $this->determineLoanClassForUser($acctno);
        $savings = $this->savingsRepository->getPersonalSavingsByAccount($acctno);

        return response()->json([
            'items' => TransactionResource::collection($transactions),
            'loanClass' => $loanClass,
            'savings' => SavingsResource::collection($savings),
        ]);
    }

    /**
     * Determine loan class for the logged-in user.
     */
    protected function determineLoanClassForUser(string $acctno): ?string
    {
        $loanRows = $this->loanRepository->getLoanRowsGroupedByAccounts([$acctno]);
        return $this->loanClassificationService->classify($loanRows->get($acctno));
    }
}
