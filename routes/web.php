<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserRejectionController;
use App\Http\Controllers\LoanTransactionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\RecentTransactionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Admin\ClientManagementController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Customer\RegistrationStatusController;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect('/admin/dashboard');
        }

        if ($user->role === 'customer') {
            if ($user->status === 'approved') {
                return redirect('/dashboard');
            }
            return redirect()->route('customer.registration.status');
        }
    }

    return Inertia::render('welcome');
})->name('welcome');

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.update');
});

Route::middleware(['guest', 'throttle:60,1', 'admin.reg.token'])->group(function () {
    Route::get('/admin-registration', [RegisteredUserController::class, 'create'])
        ->name('admin.registration');
    Route::post('/admin-registration', [RegisteredUserController::class, 'store']);
});

Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/registration-status', [RegistrationStatusController::class, 'show'])
        ->name('registration.status');

    Route::post('/register-resubmit', [RegistrationStatusController::class, 'resubmit'])
        ->name('register.resubmit');
});

Route::middleware(['auth', 'approved', 'role:customer'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('customer/dashboard');
    })->name('dashboard');

    Route::get('/api/transactions/recent', [RecentTransactionController::class, 'recent'])
        ->name('transactions.recent');

    Route::get('/loans/transactions', [LoanTransactionController::class, 'index'])
        ->name('loans.transactions');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn() => redirect()->route('admin.dashboard'));

    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');

    Route::get('/products', fn() => Inertia::render('admin/products'))->name('products');
    Route::get('/clients', fn() => Inertia::render('admin/clients'))->name('clients');

    Route::get('/client-management', [ClientManagementController::class, 'index'])
        ->name('client-management');

    // ✅ FIXED: Explicit route model binding with custom primary key
    Route::post('/client-management/approve/{user:user_id}', [ClientManagementController::class, 'approve'])
        ->name('client-management.approve');

    Route::post('/client-management/reject/{user:user_id}', [ClientManagementController::class, 'reject'])
        ->name('client-management.reject');

    Route::post('/users/{user}/reject', [UserRejectionController::class, 'reject']);
    Route::get('/users/{user}/rejection-reasons', [UserRejectionController::class, 'getRejectionReasons']);

Route::post('/clients/{acctno}/salary', [ClientManagementController::class, 'updateSalary'])
        ->name('clients.updateSalary');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
