<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationStatusController extends Controller
{
    /**
     * Show the client's registration status page
     * Displays different views based on status: pending, approved, or rejected
     *
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
            'rejection_reasons' => $user->rejectionReasons->map(function ($reason) {
                return [
                    'code' => $reason->code,
                    'label' => $reason->label,
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
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Shared resubmit logic for web/API.
     */
    private function processResubmit(Request $request, $user): void
    {
        $request->validate([
            'prc_id_photo_front' => 'nullable|image|max:8192',
            'prc_id_photo_back' => 'nullable|image|max:8192',
            'payslip_photo_path' => 'nullable|image|max:8192',
        ]);

        $disk = $this->mediaDisk();

        // Store any new uploads
        if ($request->hasFile('prc_id_photo_front')) {
            $user->prc_id_photo_front = $this->storeResubmissionUpload(
                $request,
                'prc_id_photo_front',
                'uploads/prc',
                $disk
            );
        }
        if ($request->hasFile('prc_id_photo_back')) {
            $user->prc_id_photo_back = $this->storeResubmissionUpload(
                $request,
                'prc_id_photo_back',
                'uploads/prc',
                $disk
            );
        }
        if ($request->hasFile('payslip_photo_path')) {
            $user->payslip_photo_path = $this->storeResubmissionUpload(
                $request,
                'payslip_photo_path',
                'uploads/payslips',
                $disk
            );
        }

        // Reset status for review
        $user->status = 'pending';
        $user->reviewed_at = null;
        $user->reviewed_by = null;
        $user->save();

        // Detach all previous rejection reasons
        $user->rejectionReasons()->detach();
    }

    private function storeResubmissionUpload(Request $request, string $field, string $path, string $disk): string
    {
        try {
            $storedPath = $request->file($field)?->store($path, ['disk' => $disk]);
        } catch (\Throwable $exception) {
            Log::warning('Resubmission upload failed', [
                'field' => $field,
                'disk' => $disk,
                'exception_class' => $exception::class,
                'exception' => $exception->getMessage(),
            ]);

            throw ValidationException::withMessages([
                $field => 'Upload failed. Please try again.',
            ]);
        }

        if (! $storedPath) {
            Log::warning('Resubmission upload path missing', [
                'field' => $field,
                'disk' => $disk,
            ]);

            throw ValidationException::withMessages([
                $field => 'Upload failed. Please try again.',
            ]);
        }

        return $storedPath;
    }

    private function mediaDisk(): string
    {
        return (string) config('filesystems.default', 'public');
    }
}
