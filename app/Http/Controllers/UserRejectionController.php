<?php

// app/Http/Controllers/UserRejectionController.php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\AppUser;
use App\Models\RejectionReason;

class UserRejectionController extends Controller
{
    public function reject(Request $request, $user_id)
    {
        $reasonCodes = $request->input('rejection_reasons', []); // ['prc_id_blurry', ...]
        $reasonIDs = RejectionReason::whereIn('code', $reasonCodes)->pluck('id')->toArray();

        $user = AppUser::findOrFail($user_id);
        $user->rejectionReasons()->sync($reasonIDs);

        $user->status = 'rejected';
        $user->rejected_at = now();
        $user->save();

        return response()->json(['message' => 'Rejected reasons updated successfully.']);
    }

    // To fetch reasons:
    public function getRejectionReasons($user_id)
    {
        $user = AppUser::findOrFail($user_id);
        return response()->json($user->rejectionReasons);
    }
}
