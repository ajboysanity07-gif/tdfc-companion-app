<?php

use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Customer\RegistrationStatusController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- SPA Auth Pages as Inertia routes (guest only) ---
Route::middleware('guest')->group(function () {
    Route::get('/login', fn() => Inertia::render('auth/login'))->name('login');
    Route::get('/register', fn() => Inertia::render('auth/register'))->name('register');

    // Password reset SPA pages
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

// --- Authenticated SPA pages ---
// Admin pages
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('{admin}/dashboard', fn($admin) => Inertia::render('admin/dashboard', ['admin' => $admin]))->name('dashboard');
    Route::get('products', fn() => Inertia::render('admin/products-management'))->name('products');
    Route::get('{admin}/client-management', fn($admin) => Inertia::render('admin/client-management', ['admin' => $admin]))->name('client-management');
});

// Client dashboard (approved customers only)
Route::middleware(['auth', 'role:customer', 'approved'])
    ->get('/client/{acctno}/dashboard', fn($acctno) => Inertia::render('customer/dashboard', ['acctno' => $acctno]))
    ->name('client.dashboard');

// Client registration status
Route::middleware(['auth', 'role:customer'])
    ->get('/client/{acctno}/registration-status', [RegistrationStatusController::class, 'show'])
    ->name('client.registration-status');

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store'])->middleware('throttle:6,1');
    Route::post('logout', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// No POST login/register here - those go in api.php for SPA+API!
