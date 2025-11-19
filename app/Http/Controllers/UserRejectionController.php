<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AppUser;
use App\Models\RejectionReason;

class UserRejectionController extends Controller
{
    // Reject a user with selected reasons
    public function reject(Request $request, $userId)
    {
        $request->validate([
            'rejection_reasons' => 'required|array|min:1',
            'rejection_reasons.*' => 'string|exists:rejection_reasons,code',
        ]);
        $reasonCodes = $request->input('rejection_reasons');
        $reasonIDs = RejectionReason::whereIn('code', $reasonCodes)->pluck('id')->toArray();
        $user = AppUser::findOrFail($userId);
        $user->rejectionReasons()->sync($reasonIDs);
        $user->status = 'rejected';
        $user->rejected_at = now();
        $user->save();

        return response()->json(['message' => 'Rejected reasons updated successfully.']);
    }

    // Get user's rejection reasons as JSON
    public function getRejectionReasons($userId)
    {
        $user = AppUser::findOrFail($userId);
        return response()->json($user->rejectionReasons);
    }
}
