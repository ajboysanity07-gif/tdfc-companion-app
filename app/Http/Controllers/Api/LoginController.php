<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Handle API login: POST /api/login
     * Expected: { email: string, password: string, remember: bool }
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $remember = $data['remember'] ?? false;

        // Attempt authentication using Laravel Auth
        if (Auth::attempt(['email' => $data['email'], 'password' => $data['password']], $remember)) {
            $request->session()->regenerate();

            // Optionally get user model and setup redirect path
            $user = Auth::user();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => $user->email,
                        'name' => $user->name ?? '',
                        // add more if needed (id, role, etc)
                    ],
                    'redirect_to' => '/dashboard', // or any SPA dashboard route
                ],
            ]);
        } else {
            // Invalid credentials
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }
    }
}
