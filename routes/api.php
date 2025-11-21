<?php

use App\Models\AppUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserRejectionController;
use App\Http\Controllers\WmasterLookupController;
use App\Http\Controllers\LoanTransactionController;
use App\Http\Controllers\RecentTransactionController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Admin\ClientManagementController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;


// Registration duplicate check if needed (public or auth)
Route::get('/check-register-duplicate', function (Request $request) {
    $accntnoExists = false;
    $emailExists = false;
    $phoneExists = false;
    if ($request->has('accntno')) {
        $accntnoExists = AppUser::where('acctno', $request->string('accntno'))->exists();
    }
    if ($request->has('email')) {
        $emailExists = AppUser::where('email', $request->string('email'))->exists();
    }
    if ($request->has('phone_no')) {
        $phoneExists = AppUser::where('phone_no', $request->string('phone_no'))->exists();
    }
    return [
        'accntnoExists' => $accntnoExists,
        'emailExists'   => $emailExists,
        'phoneExists'   => $phoneExists,
    ];
});
// REGISTER & LOGIN ROUTES (API ENDPOINTS) — SANCTUM SECURE
Route::post('/register', [RegisteredUserController::class, 'store']);

Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::get('/user', [AuthenticatedSessionController::class, 'user'])->middleware('auth:sanctum');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth:sanctum');

// --- ADMIN DASHBOARD APIs ---
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard/summary', [AdminDashboardController::class, 'summary']);
    Route::get('/admin/dashboard/recent-users', [AdminDashboardController::class, 'recentUsers']);
    // add more endpoints as needed
});

// Public & utility APIs (keep as needed)
Route::get('/wmaster-lookup', [WmasterLookupController::class, '__invoke'])
    ->middleware('throttle:60,1');

// Protect recent transaction, loan, and client-management APIs
Route::middleware(['auth:sanctum'])->group(function () {
    // Example user/cust APIs (keep as needed)
    Route::get('/transactions/recent', [RecentTransactionController::class, 'recent']);
    Route::get('/transactions/loan/{ln_number}/details', [LoanTransactionController::class, 'details']);
    Route::get('/transactions/loan/{ln_number}/schedule', [LoanTransactionController::class, 'schedule']);

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
});
