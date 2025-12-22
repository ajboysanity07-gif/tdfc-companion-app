<?php

use App\Models\AppUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserRejectionController;
use App\Http\Controllers\WmasterLookupController;
use App\Http\Controllers\LoanTransactionController;
use App\Http\Controllers\RecentTransactionController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Api\ProductManagementController;
use App\Http\Controllers\Api\ClientManagementController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Customer\RegistrationStatusController;
use App\Http\Controllers\Api\ProductController;

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
    // Dashboard summary & recent users
    Route::get('/admin/dashboard/summary', [AdminDashboardController::class, 'summary']);
    Route::get('/admin/dashboard/recent-users', [AdminDashboardController::class, 'recentUsers']);

    // Product Management - fetch all products with tags  
    Route::apiResource('products', ProductManagementController::class)->except(['create', 'edit']);
    Route::get('/product-types', [ProductManagementController::class, 'typesIndex']);
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
        Route::get('/clients', [ClientManagementController::class, 'index']);
        Route::post('/clients/{user}/approve', [ClientManagementController::class, 'approve']);
        Route::post('/clients/{user}/reject', [ClientManagementController::class, 'reject']);
        Route::get('/clients/{acctno}/wlnmaster', [ClientManagementController::class, 'wlnmaster']);
        Route::post('/clients/{acctno}/salary', [ClientManagementController::class, 'updateSalary']);
        Route::get('/clients/loans/{lnnumber}/wlnled', [ClientManagementController::class, 'wlnled']);
        Route::get('/clients/loans/{lnnumber}/amortization', [ClientManagementController::class, 'amortizationSchedule']);
        Route::get('/clients/loans/{lnnumber}/amortsched', [ClientManagementController::class, 'amortschedDisplay']);

        // Rejection reasons lookup
        Route::get('/rejection-reasons', [UserRejectionController::class, 'getRejectionReasons']);
        // Rejection API
        Route::post('/users/{user}/reject', [UserRejectionController::class, 'reject']);
        Route::get('/users/{user}/rejection-reasons', [UserRejectionController::class, 'getRejectionReasons']);
    });

    // --- CUSTOMER registration resubmit (SPA+API) ---
    Route::middleware(['role:customer'])->group(function () {
        Route::post('/customer/register-resubmit', [RegistrationStatusController::class, 'resubmitApi']);
    });
});
