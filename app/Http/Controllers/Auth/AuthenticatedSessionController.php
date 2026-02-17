<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginAppUserRequest;
use App\Models\AppUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function store(LoginAppUserRequest $request): JsonResponse
    {
        $loginValue = $request->string('login')->trim()->toString();
        $isEmail = filter_var($loginValue, FILTER_VALIDATE_EMAIL) !== false;
        $normalizedLogin = strtolower($loginValue);
        $credentials = [
            $isEmail ? 'email' : 'username' => $normalizedLogin,
            'password' => $request->string('password')->toString(),
        ];

        if (! Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'Invalid email/username or password.',
            ], 401);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $user = AppUser::query()
            ->when($isEmail, fn ($query) => $query->whereRaw('LOWER(email) = ?', [$normalizedLogin]))
            ->when(! $isEmail, fn ($query) => $query->whereRaw('LOWER(username) = ?', [$normalizedLogin]))
            ->firstOrFail();
        // Create token for SPA/API
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->getKey(), // primary key (user_id)
                'user_id' => $user->getKey(),
                'acctno' => $user->acctno,
                'role' => $user->role,
                'status' => $user->status,
            ],
            'token' => $token,
        ]);
    }

    public function user(): JsonResponse
    {
        return response()->json(Auth::user());
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // Revoke all tokens (API/Sanctum)
            $user->tokens()->delete();
        }

        // Log out of the session guard if present
        Auth::guard('web')->logout();

        // Invalidate session + regenerate token when sessions are available (Inertia/web)
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // Respond appropriately for API vs Inertia/web
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Logged out']);
        }

        return redirect()->route('login');
    }
}
