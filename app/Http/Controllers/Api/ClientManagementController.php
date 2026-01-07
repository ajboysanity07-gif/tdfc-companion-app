<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectClientRequest;
use App\Http\Requests\UpdateSalaryRequest;
use App\Http\Resources\AmortizationScheduleResource;
use App\Http\Resources\ClientResource;
use App\Http\Resources\LedgerResource;
use App\Models\AppUser;
use App\Repositories\ClientRepository;
use App\Repositories\LoanRepository;
use App\Repositories\SalaryRepository;
use App\Services\ClientApprovalService;
use App\Services\LoanClassificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ClientManagementController extends Controller
{
    public function __construct(
        private ClientRepository $clientRepository,
        private SalaryRepository $salaryRepository,
        private LoanRepository $loanRepository,
        private LoanClassificationService $loanClassificationService,
        private ClientApprovalService $clientApprovalService
    ) {}
    // GET /api/clients
    public function index(): JsonResponse
    {
        $users = $this->clientRepository->getAllWithDocuments();
        $acctnos = $users->pluck('acctno')->filter()->unique()->all();

        $loanRowsByAcct = $this->loanRepository->getLoanRowsGroupedByAccounts($acctnos);
        $latestSalaryByAcct = $this->salaryRepository->getLatestByAccounts($acctnos);

        $clients = $users->map(function ($user) use ($loanRowsByAcct, $latestSalaryByAcct) {
            $user->loan_class = $this->loanClassificationService->classify($loanRowsByAcct->get($user->acctno));
            $user->salary_amount = $latestSalaryByAcct->get($user->acctno)?->salary_amount;
            return $user;
        });

        return response()->json(ClientResource::collection($clients));
    }

    // POST /api/clients/{user}/approve
    public function approve(AppUser $user): JsonResponse
    {
        if (!$this->clientApprovalService->canBeApproved($user)) {
            return response()->json(['message' => 'Cannot approve non-pending user'], 400);
        }

        $this->clientApprovalService->approve($user);

        return response()->json(['success' => true]);
    }

    // POST /api/clients/{user}/reject
    public function reject(RejectClientRequest $request, AppUser $user): JsonResponse
    {
        if (!$this->clientApprovalService->canBeRejected($user)) {
            return response()->json(['message' => 'Cannot reject non-pending user'], 400);
        }

        $this->clientApprovalService->reject($user, $request->reasons);

        return response()->json(['success' => true]);
    }

    // POST /api/clients/{acctno}/salary
    public function updateSalary(UpdateSalaryRequest $request, string $acctno): JsonResponse
    {
        $user = $this->clientRepository->findByAccountOrFail($acctno);

        $row = $this->salaryRepository->updateOrCreate($user->acctno, $request->salary_amount);

        return response()->json(['message' => 'Salary record saved', 'record' => $row]);
    }

    // GET /api/clients/{acctno}/wlnmaster
    public function wlnmaster(string $acctno): JsonResponse
    {
        $user = $this->clientRepository->getByAccountWithRelations($acctno, ['wlnmaster']);

        if (!$user) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        return response()->json([
            'acctno' => $acctno,
            'records' => $user->wlnmaster,
        ]);
    }

    // GET /api/clients/loans/{lnnumber}/wlnled
    public function wlnled(string $lnnumber): JsonResponse
    {
        try {
            $rows = $this->loanRepository->getLedgerByLoanNumber($lnnumber);

            return response()->json([
                'lnnumber' => $lnnumber,
                'ledger' => LedgerResource::collection($rows),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch WLN ledger rows', [
                'lnnumber' => $lnnumber,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Unable to fetch ledger data'], 500);
        }
    }

    public function amortschedDisplay(string $lnnumber): JsonResponse
    {
        $rows = $this->loanRepository->getAmortizationSchedule(
            $lnnumber,
            ['Date_pay', 'Amortization', 'Interest', 'Balance']
        ); 

        return response()->json([
            'schedule' => AmortizationScheduleResource::collection($rows),
        ]);
    }

    public function amortizationSchedule(string $lnnumber): JsonResponse
    {
        $rows = $this->loanRepository->getAmortizationSchedule(
            $lnnumber,
            ['controlno', 'lnnumber', 'Date_pay', 'Amortization', 'Interest', 'Balance']
        );

        return response()->json([
            'lnnumber' => $lnnumber,
            'schedule' => AmortizationScheduleResource::collection($rows->map(function ($row) {
                return new AmortizationScheduleResource($row, true);
            })),
        ]);
    }
}
