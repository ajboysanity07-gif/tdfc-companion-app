<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ClientManagementController;
use App\Http\Controllers\UserRejectionController;

// Public & utility APIs (keep as needed)
Route::get('/wmaster-lookup', [\App\Http\Controllers\WmasterLookupController::class, '__invoke'])
    ->middleware('throttle:60,1');

// Protect recent transaction, loan, and client-management APIs
Route::middleware(['auth:sanctum'])->group(function () {
    // Example user/cust APIs (keep as needed)
    Route::get('/transactions/recent', [\App\Http\Controllers\RecentTransactionController::class, 'recent']);
    Route::get('/transactions/loan/{ln_number}/details', [\App\Http\Controllers\LoanTransactionController::class, 'details']);
    Route::get('/transactions/loan/{ln_number}/schedule', [\App\Http\Controllers\LoanTransactionController::class, 'schedule']);

    // --- ADMIN Management endpoints (SPA+API) ---
    Route::middleware(['role:admin'])->group(function () {
        // Client Management
        Route::get('/clients', [ClientManagementController::class, 'apiIndex']);
        Route::post('/clients/{user}/approve', [ClientManagementController::class, 'apiApprove']);
        Route::post('/clients/{user}/reject', [ClientManagementController::class, 'apiReject']);
        Route::post('/clients/{acctno}/salary', [ClientManagementController::class, 'updateSalary']);

        // Rejection API
        Route::post('/users/{user}/reject', [UserRejectionController::class, 'reject']);
        Route::get('/users/{user}/rejection-reasons', [UserRejectionController::class, 'getRejectionReasons']);
    });

    // Registration duplicate check if needed (public or auth)
    Route::get('/check-register-duplicate', function(\Illuminate\Http\Request $request) {
        $accntnoExists = false;
        $emailExists = false;
        if ($request->has('accntno')) {
            $accntnoExists = \App\Models\AppUser::where('acctno', $request->string('accntno'))->exists();
        }
        if ($request->has('email')) {
            $emailExists = \App\Models\AppUser::where('email', $request->string('email'))->exists();
        }
        return [
            'accntnoExists' => $accntnoExists,
            'emailExists'   => $emailExists,
        ];
    });
});
