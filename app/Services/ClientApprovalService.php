<?php

namespace App\Services;

use App\Models\AppUser;
use App\Models\RejectionReason;
use Illuminate\Support\Facades\Auth;

class ClientApprovalService
{
    /**
     * Approve a pending client.
     */
    public function approve(AppUser $user): bool
    {
        if ($user->status !== AppUser::STATUS_PENDING) {
            return false;
        }

        $user->status = AppUser::STATUS_APPROVED;
        $user->reviewed_at = now();
        $user->reviewed_by = Auth::id();
        $user->rejectionReasons()->detach();
        $user->save();

        return true;
    }

    /**
     * Reject a pending client with reasons.
     */
    public function reject(AppUser $user, array $reasonCodes): bool
    {
        if ($user->status !== AppUser::STATUS_PENDING) {
            return false;
        }

        $reasonIds = RejectionReason::whereIn('code', $reasonCodes)
            ->pluck('id')
            ->toArray();

        $user->rejectionReasons()->sync($reasonIds);
        $user->status = AppUser::STATUS_REJECTED;
        $user->reviewed_at = now();
        $user->reviewed_by = Auth::id();
        $user->save();

        return true;
    }

    /**
     * Check if user can be approved.
     */
    public function canBeApproved(AppUser $user): bool
    {
        return $user->status === AppUser::STATUS_PENDING;
    }

    /**
     * Check if user can be rejected.
     */
    public function canBeRejected(AppUser $user): bool
    {
        return $user->status === AppUser::STATUS_PENDING;
    }
}
