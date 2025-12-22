<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\Amortsched;
use App\Models\RejectionReason;
use App\Models\WSalaryRecord;
use App\Models\WlnLed;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class ClientManagementController extends Controller
{
    // GET /api/clients
    public function index(): JsonResponse
    {
        $users = AppUser::with(['wmaster', 'rejectionReasons:id,code,label'])
            ->whereNotNull('prc_id_photo_front')
            ->whereNotNull('prc_id_photo_back')
            ->whereNotNull('payslip_photo_path')
            ->orderBy('created_at', 'asc')
            ->get();

        $loanRowsByAcct     = $this->fetchLoanRowsGroupedByAcct($users);
        $latestSalaryByAcct = $this->fetchLatestSalaryByAcct($users);

        $clients = $users->map(function ($user) use ($loanRowsByAcct, $latestSalaryByAcct) {
            $overallClass = $this->determineLoanClassFromRows($loanRowsByAcct->get($user->acctno));
            $latestSalary = $latestSalaryByAcct->get($user->acctno);

            return [
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_picture_path' => $user->profile_picture_path,
                'phone_no' => $user->phone_no,
                'acctno' => $user->acctno,
                'status' => $user->status,
                'class' => $overallClass,
                'prc_id_photo_front' => $user->prc_id_photo_front,
                'prc_id_photo_back' => $user->prc_id_photo_back,
                'payslip_photo_path' => $user->payslip_photo_path,
                'created_at' => $user->created_at->toISOString(),
                'reviewed_at' => $user->reviewed_at?->toISOString(),
                'reviewed_by' => $user->reviewed_by,
                'salary_amount' => $latestSalary?->salary_amount,
                'rejection_reasons' => $user->isRejected()
                    ? $user->rejectionReasons->map(fn($r) => [
                        'code' => $r->code,
                        'label' => $r->label,
                    ])->toArray()
                    : [],
            ];
        });

        return response()->json($clients);
    }

    // POST /api/clients/{user}/approve
    public function approve(AppUser $user): JsonResponse
    {
        if ($user->status !== 'pending') {
            return response()->json(['message' => 'Cannot approve non-pending user'], 400);
        }

        $user->status = 'approved';
        $user->reviewed_at = now();
        $user->reviewed_by = Auth::id();
        $user->rejectionReasons()->detach();
        $user->save();

        return response()->json(['success' => true]);
    }

    // POST /api/clients/{user}/reject
    public function reject(Request $request, AppUser $user): JsonResponse
    {
        if ($user->status !== 'pending') {
            return response()->json(['message' => 'Cannot reject non-pending user'], 400);
        }

        $validated = $request->validate([
            'reasons' => 'required|array|min:1',
            'reasons.*' => 'string|exists:rejection_reasons,code',
        ]);

        $reasonIds = RejectionReason::whereIn('code', $validated['reasons'])->pluck('id')->toArray();
        $user->rejectionReasons()->sync($reasonIds);
        $user->status = 'rejected';
        $user->reviewed_at = now();
        $user->reviewed_by = Auth::id();
        $user->save();

        return response()->json(['success' => true]);
    }

    // POST /api/clients/{acctno}/salary
    public function updateSalary(Request $request, $acctno): JsonResponse
    {
        $user = AppUser::where('acctno', $acctno)->firstOrFail();

        $validated = $request->validate([
            'salary_amount' => 'required|numeric|min:0.01',
        ]);

        $row = WSalaryRecord::updateOrCreate(
            ['acctno' => $user->acctno],
            ['salary_amount' => $validated['salary_amount']]
        );

        return response()->json(['message' => 'Salary record saved', 'record' => $row]);
    }

    // GET /api/clients/{acctno}/wlnmaster
    public function wlnmaster(string $acctno): JsonResponse
    {
        $user = AppUser::with('wlnmaster')->where('acctno', $acctno)->first();
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
            $connectionName = (new WlnLed())->getConnectionName() ?? config('database.default');
            $schema = Schema::connection($connectionName);
            $hasLntype = $schema->hasColumn('wlnled', 'lntype');

            $selectColumns = [
                'controlno',
                'lnnumber',
                'date_in',
                'mreference',
                'cs_ck',
                'principal',
                'payments',
                'debit',
                'credit',
                'balance',
                'accruedint',
            ];
            if ($hasLntype) {
                $selectColumns[] = 'lntype';
            }

            $rows = WlnLed::query()
                ->where('lnnumber', $lnnumber)
                ->orderBy('controlno')
                ->get($selectColumns);

            $ledger = $rows->map(function (WlnLed $row) {
                return [
                    'date_in' => $row->date_in?->toISOString(),
                    'mreference' => $row->mreference,
                    'lntype' => $row->lntype ?? null,
                    'transaction_code' => $row->cs_ck,
                    'principal' => $row->principal,
                    'payments' => $row->payments,
                    'debit' => $row->debit,
                    'credit' => $row->credit,
                    'balance' => $row->balance,
                    'accruedint' => $row->accruedint,
                ];
            });

            return response()->json([
                'lnnumber' => $lnnumber,
                'ledger' => $ledger,
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
        $rows = Amortsched::query()
            ->where('lnnumber', $lnnumber)
            ->orderBy('Date_pay', 'desc')
            ->get(['Date_pay', 'Amortization', 'Interest', 'Balance'])
            ->map(function (Amortsched $row) {
                return [
                    'date_pay' => optional($row->Date_pay)->toISOString(),
                    'amortization' => $row->Amortization,
                    'interest' => $row->Interest,
                    'balance' => $row->Balance,
                ];
            });

        return response()->json([
            'schedule' => $rows,
        ]);
    }

    public function amortizationSchedule(string $lnnumber): JsonResponse
    {
        $rows = Amortsched::query()
            ->where('lnnumber', $lnnumber)
            ->orderBy('Date_pay', 'desc')
            ->get(['controlno', 'lnnumber', 'Date_pay', 'Amortization', 'Interest', 'Balance'])
            ->map(function (Amortsched $row) {
                return [
                    'controlno' => (string) $row->controlno,
                    'lnnumber' => (string) $row->lnnumber,
                    'date_pay' => optional($row->Date_pay)->toISOString(),
                    'amortization' => $row->Amortization,
                    'interest' => $row->Interest,
                    'balance' => $row->Balance,
                ];
            });

        return response()->json([
            'lnnumber' => $lnnumber,
            'schedule' => $rows,
        ]);
    }

    // ---- Helpers ----

    protected function fetchLatestSalaryByAcct($users)
    {
        $acctnos = $users->pluck('acctno')->filter()->unique()->all();
        if (empty($acctnos)) {
            return collect();
        }

        $latestDates = WSalaryRecord::select('acctno', DB::raw('MAX(created_at) as created_at'))
            ->whereIn('acctno', $acctnos)
            ->groupBy('acctno');

        $rows = WSalaryRecord::joinSub($latestDates, 'latest', function ($join) {
                $join->on('wsalary_records.acctno', '=', 'latest.acctno')
                    ->on('wsalary_records.created_at', '=', 'latest.created_at');
            })
            ->get(['wsalary_records.*']);

        return $rows->keyBy('acctno');
    }

    protected function fetchLoanRowsGroupedByAcct($users)
    {
        $acctnos = $users->pluck('acctno')->filter()->unique()->all();
        if (empty($acctnos)) {
            return collect();
        }

        $connectionName = env('LOAN_CLASS_CONNECTION', $users->first()->getConnectionName() ?? config('database.default'));
        $loanTable = env('LOAN_CLASS_TABLE', 'vloandue');

        try {
            $rows = DB::connection($connectionName)
                ->table($loanTable)
                ->whereIn('acctno', $acctnos)
                ->get();

            return collect($rows)->groupBy('acctno');
        } catch (\Throwable $e) {
            Log::warning('Unable to batch query loan class data', [
                'connection' => $connectionName,
                'table' => $loanTable,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

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
}
