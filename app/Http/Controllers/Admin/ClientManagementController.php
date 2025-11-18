<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use App\Models\AppUser;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\RejectionReason;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log; // <-- make sure this is here
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\WSalaryRecord;

class ClientManagementController extends Controller
{
    /**
     * Display the admin dashboard with all user registrations.
     * Now attaches an "overall_class" for each user based on loan history in vloandue, following day-based logic with priority (D > C > B > A).
     */
    public function index(): InertiaResponse|RedirectResponse
    {
        try {
            // Just use your Eloquent relationships!
            $allUsers = AppUser::with(['wmaster', 'rejectionReasons:id,code,label'])
                ->whereNotNull('prc_id_photo_front')
                ->whereNotNull('prc_id_photo_back')
                ->whereNotNull('payslip_photo_path')
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($user) {
                    $loanRows = DB::table('vloandue')
                        ->where('acctno', $user->acctno)
                        ->get();

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
                            $classPriority = 1; // Class A
                        } elseif ($misspayment == 999 && $diffDays !== null) {
                            if ($diffDays < 60) {
                                $classPriority = 2; // Class B
                            } elseif ($diffDays >= 60 && $diffDays < 90) {
                                $classPriority = 3; // Class C
                            } elseif ($diffDays >= 90) {
                                $classPriority = 4; // Class D
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
                        'name' => $user->name, // <-- returns bname from wmaster if available!
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
                        // ADDED: Include salary data
                        'salary_amount' => $latestSalary?->salary_amount,
                        'notes' => $latestSalary?->notes,
                        'rejection_reasons' => $user->isRejected()
                            ? $user->rejectionReasons->map(fn($r) => [
                                'code' => $r->code,
                                'label' => $r->label
                            ])->toArray()
                            : [],
                    ];
                });

            $rejectionReasons = RejectionReason::select(['code', 'label'])->get();

            return Inertia::render('admin/client-management', [
                'pendingUsers' => $allUsers,
                'rejectionReasons' => $rejectionReasons,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading client management page', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Error loading client management page');
        }
    }

    /**
     * Approve a user's registration.
     */
    public function approve(AppUser $user): RedirectResponse
    {
        try {
            Log::info('Approve request received', [
                'user_id' => $user->user_id,
                'user_status' => $user->status,
                'reviewed_by' => auth()->id(),
            ]);

            if ($user->status !== 'pending') {
                return redirect()->back()->with('error', 'This registration cannot be approved.');
            }

            DB::beginTransaction();

            $user->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => auth()->id(),
            ]);

            // Remove any old rejection reasons
            $user->rejectionReasons()->detach();

            DB::commit();

            Log::info('User approved successfully', [
                'user_id' => $user->user_id,
                'reviewed_by' => auth()->id(),
            ]);

            return redirect()->back()->with('success', "{$user->name} has been approved successfully!");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error approving user', [
                'user_id' => $user->user_id ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Error approving user: ' . $e->getMessage());
        }
    }

    /**
     * Reject a user's registration.
     */
    public function reject(Request $request, AppUser $user): RedirectResponse
    {
        try {
            Log::info('Reject request received', [
                'user_id' => $user->user_id,
                'user_status' => $user->status,
                'reasons' => $request->input('reasons'),
                'reviewed_by' => auth()->id(),
            ]);

            if ($user->status !== 'pending') {
                return redirect()->back()->with('error', 'This registration cannot be rejected.');
            }

            $validated = $request->validate([
                'reasons' => 'required|array|min:1',
                'reasons.*' => 'string|exists:rejection_reasons,code'
            ]);

            $reasonIds = RejectionReason::whereIn('code', $validated['reasons'])
                ->pluck('id')
                ->toArray();

            DB::beginTransaction();

            // Sync rejection reasons
            $user->rejectionReasons()->sync($reasonIds);

            // Update status to rejected
            $user->update([
                'status' => 'rejected',
                'reviewed_at' => now(),
                'reviewed_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->back()->with('success', "{$user->name}'s registration has been rejected.");
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error rejecting user', [
                'user_id' => $user->user_id ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Error rejecting user: ' . $e->getMessage());
        }
    }

    /**
     * Save salary record for user in wsalary_records table.
     */
public function updateSalary(Request $request, $acctno)
{
    Log::info('updateSalary called', ['acctno' => $acctno]);

    // Find the user associated with the given acctno
    $user = AppUser::where('acctno', $acctno)->firstOrFail();

    $validated = $request->validate([
        'salary_amount' => ['required', 'numeric', 'min:0.01'],
        'notes' => ['nullable', 'string', 'max:255'],
    ]);

    try {
        Log::info('Inserting salary record', [
            'acctno' => $user->acctno,
            'salary_amount' => $validated['salary_amount'],
            'notes' => $validated['notes'] ?? null
        ]);

        $row = WSalaryRecord::create([
            'acctno'        => $user->acctno,
            'salary_amount' => $validated['salary_amount'],
            'notes'         => $validated['notes'] ?? null,
        ]);
        Log::info('Salary record created', ['id' => $row->id ?? null]);
        return response()->json(['message' => 'Salary record saved', 'record' => $row]);
    } catch (\Exception $e) {
        Log::error('Error saving salary record', ['msg' => $e->getMessage()]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
