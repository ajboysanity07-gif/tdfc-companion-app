<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationStatusController extends Controller
{
    /**
     * Show the client's registration status page
     * Displays different views based on status: pending, approved, or rejected
     * 
     * @param Request $request
     * @return Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Request $request)
    {
        $user = $request->user();

        // If user is approved, redirect them to the main dashboard
        if ($user->status === 'approved') {
            return redirect()->route('dashboard');
        }

        // Always eager-load rejectionReasons, in case user is rejected
        $user->load(['rejectionReasons', 'wmaster']);

        // --- Find the reviewer's name if reviewed_by exists ---
        $reviewer = null;
        if ($user->reviewed_by) {
            // Change User to your actual admin model if needed
            $reviewerModel = \App\Models\AppUser::find($user->reviewed_by);
            $reviewer = $reviewerModel
                ? ($reviewerModel->name ?? $reviewerModel->email)
                : null;
        }

        // Show status page for pending or rejected users
        return Inertia::render('client/registration-status', [
            'name' => $user->wmaster?->bname ?? $user->name,
            'bname' => $user->wmaster?->bname,
            'acctno' => $user->acctno,
            'status' => $user->status,
            'rejection_reasons' => $user->rejectionReasons->map(function($reason) {
                return [
                    'code' => $reason->code,
                    'label' => $reason->label
                ];
            })->values(),
            'submitted_at' => $user->created_at->toISOString(),
            'reviewed_at' => $user->reviewed_at?->toISOString(),
            'reviewed_by' => $reviewer, // <-- NEW!
        ]);
    }

        /**
     * Handle resubmission of registration documents by the user after rejection.
     */
    public function resubmit(Request $request)
    {
        $user = $request->user();

        $this->processResubmit($request, $user);

        // Redirect WITH FLASH MESSAGE
        return redirect()
            ->route('client.registration.status')
            ->with('success', 'Resubmission successful! Your application is under review again.');
    }

    /**
     * API variant for resubmission (Sanctum).
     */
    public function resubmitApi(Request $request)
    {
        $user = $request->user();

        try {
            $this->processResubmit($request, $user);
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Shared resubmit logic for web/API.
     */
    private function processResubmit(Request $request, $user): void
    {
        $validated = $request->validate([
            'prc_id_photo_front' => 'nullable|image|max:8192',
            'prc_id_photo_back'  => 'nullable|image|max:8192',
            'payslip_photo_path'      => 'nullable|image|max:8192',
        ]);

        // Store any new uploads
        if ($request->hasFile('prc_id_photo_front')) {
            $user->prc_id_photo_front = $request->file('prc_id_photo_front')->store('uploads/prc', 'public');
        }
        if ($request->hasFile('prc_id_photo_back')) {
            $user->prc_id_photo_back = $request->file('prc_id_photo_back')->store('uploads/prc', 'public');
        }
        if ($request->hasFile('payslip_photo_path')) {
            $user->payslip_photo_path = $request->file('payslip_photo_path')->store('uploads/payslips', 'public');
        }

        // Reset status for review
        $user->status = 'pending';
        $user->reviewed_at = null;
        $user->reviewed_by = null;
        $user->save();

        // Detach all previous rejection reasons
        $user->rejectionReasons()->detach();
    }
}
