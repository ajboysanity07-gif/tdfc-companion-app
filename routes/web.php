<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// --- Controllers ---
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Api\LoanTransactionController;
use App\Http\Controllers\Customer\RegistrationStatusController;
// --- Welcome / Landing Page ---
Route::get('/', function () {
    // Test database connection inline
    try {
        $dbTest = \DB::connection('sqlsrv')->select('SELECT TOP 1 email FROM app_user_table');
        \Log::info('Database test successful', ['result' => $dbTest]);
    } catch (\Exception $e) {
        \Log::error('Database test failed', ['error' => $e->getMessage()]);
    }
    
    return Inertia::render('welcome'); // or your SPA root component
})->name('welcome');


// --- Auth / Registration: Public (Guest) ---
Route::middleware('guest')->group(function () {
    // Password management
    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.update');
});

// // --- Customer (Authenticated) ---
// Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
//     Route::get('/registration-status', [RegistrationStatusController::class, 'show'])
//         ->name('registration.status');
//     Route::post('/register-resubmit', [RegistrationStatusController::class, 'resubmit'])
//         ->name('register.resubmit');
// });

// // --- Customer Dashboard, API, Loans (Approved) ---
// Route::middleware(['auth', 'approved', 'role:customer'])->group(function () {
//     Route::get('/dashboard', fn() => Inertia::render('customer/dashboard'))->name('dashboard');

//     Route::get('/loans/transactions', [LoanTransactionController::class, 'index'])
//         ->name('loans.transactions');
// });

// --- Admin Dashboard / Management (Role:Admin) ---
// Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
//     Route::get('/', fn() => redirect()->route('admin.dashboard'));
//     // Route::get('/dashboard', fn() => Inertia::render('admin/dashboard'))->name('dashboard');
//     Route::get('/client-management', fn() => Inertia::render('admin/client-management'))->name('client-management');
//     Route::get('/products', fn() => Inertia::render('admin/products-management'))->name('products');
//     Route::get('/clients', fn() => Inertia::render('admin/clients'))->name('clients');
// });

// --- Modular Route Include ---
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::get('/{any}', function () {
    return Inertia::render('welcome'); // or your SPA root, e.g. 'app' or main SPA page
})->where('any', '.*');
// TIP: No code changes required for SPA/API transition here.
