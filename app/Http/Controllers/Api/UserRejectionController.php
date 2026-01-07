<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AppUser;
use App\Models\RejectionReason;

class UserRejectionController extends Controller
{
    /**
     * Returns a list of possible rejection reasons (admin only) – JSON response.
     */
    public function getRejectionReasons(Request $request)
    {
        // Adjust this if your reasons are static or seeded
        $reasons = RejectionReason::all();

        return response()->json([
            'success' => true,
            'reasons' => $reasons,
        ]);
    }

    /**
     * Rejects a user with a reason (admin only) – JSON response.
     */
    public function reject(Request $request)
    {
        $request->validate([
            'userid' => 'required|exists:appusertable,userid',
            'reasonid' => 'required|exists:rejectionreasons,id'
        ]);

        $user = AppUser::findOrFail($request->userid);
        $user->status = 'rejected';
        $user->rejectedat = now();
        $user->reviewedby = $request->user()->userid;
        $user->save();

        // Attach reason to user (many-to-many, see your model relation)
        $user->rejectionReasons()->attach($request->reasonid);

        return response()->json([
            'success' => true,
            'message' => 'User rejected with reason.',
            'user'    => $user,
        ]);
    }
}
