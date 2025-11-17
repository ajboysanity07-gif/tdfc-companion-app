<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NewPasswordController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('auth/reset-password', [
            'token' => $request->route('token'),
            'email' => $request->query('email'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required','email'],
            'password' => ['required','confirmed','min:8'],
        ]);

        $status = Password::broker('users')->reset(
            $request->only('email','password','password_confirmation','token'),
            function ($user, $password) {
                $user->password = $password;
                $user->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('status', __($status))
            : back()->withErrors(['email' => [__($status)]]);
    }
}
