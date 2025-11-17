<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginAppUserRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/login');
    }
public function store(LoginAppUserRequest $request): RedirectResponse
{
    $credentials = $request->only('email', 'password');

    if (! Auth::attempt($credentials, $request->boolean('remember'))) {
        return back()->withErrors([
            'email' => 'Invalid credentials.',
        ])->onlyInput('email');
    }

    $request->session()->regenerate();

    $user = $request->user();

    // Customer pending approval check
    if ($user->role === 'customer' && $user->status !== 'approved') {
        return redirect()->route('customer.registration.status');
    }

    // ✅ FIXED: Admin redirect to full dashboard path
    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard'); // This points to /admin/dashboard
    }

    // Customer approved - go to customer dashboard
    return redirect()->route('dashboard'); // This points to /dashboard
}




    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome');
    }
}
