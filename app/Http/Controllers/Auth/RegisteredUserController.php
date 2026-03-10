<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterAppUserRequest;
use App\Models\AppUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Throwable;

class RegisteredUserController extends Controller
{
    public function store(RegisterAppUserRequest $request): JsonResponse
    {
        try {
            $paths = [
                'profile_picture_path' => $request->file('profilepicture')?->storePublicly('uploads', ['disk' => 'public']),
                'prc_id_photo_front' => $request->file('prcidphotofront')?->storePublicly('uploads', ['disk' => 'public']),
                'prc_id_photo_back' => $request->file('prcidphotoback')?->storePublicly('uploads', ['disk' => 'public']),
                'payslip_photo_path' => $request->file('payslipphoto')?->storePublicly('uploads', ['disk' => 'public']),
            ];

            $userData = [
                'acctno' => $request->string('acctno')->toString(),
                'phone_no' => $request->string('phoneno')->toString(),
                'email' => strtolower(trim($request->string('email')->toString())),
                'username' => strtolower(trim($request->string('username')->toString())),
                'password' => Hash::make($request->input('password')),
                'profile_picture_path' => $paths['profile_picture_path'],
                'prc_id_photo_front' => $paths['prc_id_photo_front'],
                'prc_id_photo_back' => $paths['prc_id_photo_back'],
                'payslip_photo_path' => $paths['payslip_photo_path'],
                'role' => 'client',
                'status' => 'pending',
            ];

            AppUser::create($userData);

            return response()->json([
                'message' => 'Registration successful',
                'redirect_to' => '/login',
            ], 201);
        } catch (Throwable $exception) {
            Log::error('Registration failed', [
                'acctno' => $request->input('acctno'),
                'email' => $request->input('email'),
                'username' => $request->input('username'),
                'phone_no' => $request->input('phoneno'),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Registration failed. Please try again later.',
            ], 500);
        }
    }
}
