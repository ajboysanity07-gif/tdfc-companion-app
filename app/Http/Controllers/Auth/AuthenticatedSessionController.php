<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginAppUserRequest;
use App\Models\AppUser;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthenticatedSessionController extends Controller
{
    public function store(LoginAppUserRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::guard('web')->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        $user = AppUser::where('email', $request->email)->firstOrFail();
        // Create token for SPA/API
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id'     => $user->getKey(), // primary key (user_id)
                'user_id'=> $user->getKey(),
                'acctno' => $user->acctno,
                'role'   => $user->role,
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
