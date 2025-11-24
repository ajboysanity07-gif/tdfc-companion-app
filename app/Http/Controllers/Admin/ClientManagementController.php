<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\AppUser;
use Illuminate\Http\Request;
use App\Models\WSalaryRecord;
use App\Models\RejectionReason;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClientManagementController extends Controller
{
    // Return all clients for admin management as JSON (SPA/API)
    public function apiIndex(Request $request)
    {
        try {
            $clients = AppUser::with(['wmaster', 'rejectionReasons:id,code,label'])
                ->whereNotNull('prc_id_photo_front')
                ->whereNotNull('prc_id_photo_back')
                ->whereNotNull('payslip_photo_path')
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($user) {
                    // Inline old class detection logic against vloandue
                    $loanRows = collect();
                    try {
                        $loanConnection = DB::connection($user->getConnectionName());
                        if ($loanConnection->getSchemaBuilder()->hasTable('vloandue')) {
                            $loanRows = $loanConnection
                                ->table('vloandue')
                                ->where('acctno', $user->acctno)
                                ->get();
                        } else {
                            Log::warning('vloandue table missing while loading client list', [
                                'acctno' => $user->acctno,
                            ]);
                        }
                    } catch (\Throwable $e) {
                        Log::warning('Unable to query vloandue while loading client list', [
                            'acctno' => $user->acctno,
                            'error' => $e->getMessage(),
                        ]);
                    }

                    $highestClassPriority = null;
                    foreach ($loanRows as $loanData) {
                        $misspayment = $loanData->misspayment ?? null;
                        $dateEnd = isset($loanData->date_end)
                            ? Carbon::parse($loanData->date_end)
                            : null;
                        $now = Carbon::now();
                        $diffDays = $dateEnd ? $dateEnd->diffInDays($now, false) : null;
                        $classPriority = null;

                        if ($misspayment != 999) {
                            $classPriority = 1; // A
                        } elseif ($misspayment == 999 && $diffDays !== null) {
                            if ($diffDays < 60) {
                                $classPriority = 2; // B
                            } elseif ($diffDays >= 60 && $diffDays < 90) {
                                $classPriority = 3; // C
                            } elseif ($diffDays >= 90) {
                                $classPriority = 4; // D
                            }
                        }

                        if ($classPriority !== null && ($highestClassPriority === null || $classPriority > $highestClassPriority)) {
                            $highestClassPriority = $classPriority;
                        }
                    }

                    $overallClass = null;
                    if ($highestClassPriority === 1) {
                        $overallClass = 'A';
                    } elseif ($highestClassPriority === 2) {
                        $overallClass = 'B';
                    } elseif ($highestClassPriority === 3) {
                        $overallClass = 'C';
                    } elseif ($highestClassPriority === 4) {
                        $overallClass = 'D';
                    }

                    $latestSalary = WSalaryRecord::where('acctno', $user->acctno)
                        ->orderBy('created_at', 'desc')
                        ->first();

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
                        'notes' => $latestSalary?->notes,
                        'rejection_reasons' => $user->isRejected()
                            ? $user->rejectionReasons->map(fn($r) => [
                                'code' => $r->code,
                                'label' => $r->label,
                            ])->toArray()
                            : [],
                    ];
                });

            return response()->json($clients);
        } catch (\Exception $e) {
            Log::error('Error loading client management list', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Error loading clients'], 500);
        }
    }

    // Approve user
    public function apiApprove($userId)
    {
        try {
            $user = AppUser::findOrFail($userId);
            if ($user->status !== 'pending') {
                return response()->json(['error' => 'Cannot approve non-pending user'], 400);
            }

            $user->status = 'approved';
            $user->reviewed_at = now();
            $user->reviewed_by = Auth::id();
            $user->rejectionReasons()->detach(); // Remove rejection reasons if any
            $user->save();

            return response()->json(['success' => true, 'user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Reject user
    public function apiReject(Request $request, $userId)
    {
        try {
            $user = AppUser::findOrFail($userId);
            if ($user->status !== 'pending') {
                return response()->json(['error' => 'Cannot reject non-pending user'], 400);
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

            return response()->json(['success' => true, 'user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Save salary record for a user
    public function updateSalary(Request $request, $acctno)
    {
        Log::info('updateSalary called', ['acctno' => $acctno]);
        $user = AppUser::where('acctno', $acctno)->firstOrFail();
        $validated = $request->validate([
            'salary_amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:255',
        ]);
        try {
            Log::info('Inserting salary record', [
                'acctno' => $user->acctno,
                'salary_amount' => $validated['salary_amount'],
                'notes' => $validated['notes'] ?? null,
            ]);
            $row = WSalaryRecord::create([
                'acctno' => $user->acctno,
                'salary_amount' => $validated['salary_amount'],
                'notes' => $validated['notes'] ?? null,
            ]);
            Log::info('Salary record created', ['id' => $row->id ?? null]);
            return response()->json(['message' => 'Salary record saved', 'record' => $row]);
        } catch (\Exception $e) {
            Log::error('Error saving salary record', ['msg' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
