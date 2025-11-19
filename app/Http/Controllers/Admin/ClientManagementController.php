<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\AppUser;
use App\Models\RejectionReason;
use App\Models\WSalaryRecord;
use App\Http\Controllers\Controller;
class ClientManagementController extends Controller
{
    // Return all clients for admin management as JSON
    public function apiIndex(Request $request)
    {
        $clients = AppUser::with('wmaster', 'rejectionReasons:id,code,label')
            ->whereNotNull('prc_id_photo_front')
            ->whereNotNull('prc_id_photo_back')
            ->whereNotNull('payslip_photo_path')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($user) {
                return [
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_picture_path' => $user->profile_picture_path,
                    'phone_no' => $user->phone_no,
                    'acctno' => $user->acctno,
                    'status' => $user->status,
                    'class' => $user->overallClass ?? null,
                    'prc_id_photo_front' => $user->prc_id_photo_front,
                    'prc_id_photo_back' => $user->prc_id_photo_back,
                    'payslip_photo_path' => $user->payslip_photo_path,
                    'created_at' => Carbon::parse($user->created_at)->toISOString(),
                    'reviewed_at' => $user->reviewed_at ? Carbon::parse($user->reviewed_at)->toISOString() : null,
                    'reviewed_by' => $user->reviewed_by,
                    'salary_amount' => optional($user->latestSalary)->salary_amount,
                    'notes' => optional($user->latestSalary)->notes,
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
