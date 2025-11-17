<?php

use App\Models\AppUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WmasterLookupController;
use App\Http\Controllers\LoanTransactionController;
use App\Http\Controllers\RecentTransactionController;
use App\Http\Controllers\Api\ProductController;
// ✅ Your existing route - keep as is
Route::get('/wmaster/lookup', WmasterLookupController::class)->middleware('throttle:60,1');

// ✅ ADD THESE NEW ROUTES for loan transactions
Route::middleware(['web','auth'])->group(function () {
    
    // ✅ Recent transactions (used by dashboard)
    Route::get('/transactions/recent', [RecentTransactionController::class, 'recent'])
        ->name('api.transactions.recent');
    
    // ✅ Loan transaction details (for modal)
    Route::get('/transactions/loan/{lnnumber}/details', [LoanTransactionController::class, 'details'])
        ->name('api.loan.details');
    
    // ✅ Loan amortization schedule (for modal)
    Route::get('/transactions/loan/{lnnumber}/schedule', [LoanTransactionController::class, 'schedule'])
        ->name('api.loan.schedule');
});
Route::get('/check-register-duplicate', function (Request $request) {
    $accntnoExists = false;
    $emailExists = false;
    if ($request->has('accntno')) {
        $accntnoExists = AppUser::where('accntno', $request->string('accntno'))->exists();
    }
    if ($request->has('email')) {
        $emailExists = AppUser::where('email', $request->string('email'))->exists();
    }
    return [
        'accntnoExists' => $accntnoExists,
        'emailExists' => $emailExists,
    ];
});



Route::middleware(['web', 'auth', 'role:admin'])->prefix('admin/products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('{typecode}', [ProductController::class, 'show']);
    Route::post('/', [ProductController::class, 'store']);
    Route::put('{typecode}', [ProductController::class, 'update']);
    Route::delete('{typecode}', [ProductController::class, 'destroy']);
    Route::post('{typecode}/tags', [ProductController::class, 'addTag']);
});
