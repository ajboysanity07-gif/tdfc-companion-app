<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Client\RegistrationStatusController;
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
    Route::get('{admin}/products', fn($admin) => Inertia::render('admin/products-management', ['admin' => $admin]))->name('products');
    Route::get('{admin}/client-management', fn($admin) => Inertia::render('admin/client-management', ['admin' => $admin]))->name('client-management');
});

// Client dashboard (approved clients only)
Route::middleware(['auth', 'role:client', 'approved'])
    ->get('/client/{acctno}/dashboard', fn($acctno) => Inertia::render('client/dashboard', ['acctno' => $acctno]))
    ->name('client.dashboard');

// Client loans page
Route::middleware(['auth', 'role:client', 'approved'])
    ->get('/client/{acctno}/loans', fn($acctno) => Inertia::render('client/loans', ['acctno' => $acctno]))
    ->name('client.loans');

// Client loan calculator
Route::middleware(['auth', 'role:client', 'approved'])
    ->get('/client/{acctno}/loan-calculator', fn($acctno) => Inertia::render('client/calculator', ['acctno' => $acctno]))
    ->name('client.loan-calculator');

// Client account settings
Route::middleware(['auth', 'role:client', 'approved'])
    ->get('/client/{acctno}/account', fn($acctno) => Inertia::render('settings/profile', ['acctno' => $acctno]))
    ->name('client.account');

// Client registration status
Route::middleware(['auth'])
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
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// No POST login/register here - those go in api.php for SPA+API!
