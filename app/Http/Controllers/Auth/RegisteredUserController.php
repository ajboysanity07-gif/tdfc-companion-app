<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterAppUserRequest;
use App\Models\AppUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class RegisteredUserController extends Controller
{
    public function store(RegisterAppUserRequest $request): JsonResponse
    {
        // Handles file uploads
        $paths = [
            'profile_picture_path' => $request->file('profilepicture')?->store('uploads'),
            'prc_id_photo_front' => $request->file('prcidphotofront')?->store('uploads'),
            'prc_id_photo_back' => $request->file('prcidphotoback')?->store('uploads'),
            'payslip_photo_path' => $request->file('payslipphoto')?->store('uploads'),
        ];

        // Prepare user data
        $userData = [
            'acctno' => $request->input('accntno'),
            'phone_no' => $request->input('phoneno'),
            'email' => strtolower(trim($request->input('email'))),
            'username' => strtolower(trim($request->input('username'))),
            'password' => Hash::make($request->input('password')),
            'profile_picture_path' => $paths['profile_picture_path'],
            'prc_id_photo_front' => $paths['prc_id_photo_front'],
            'prc_id_photo_back' => $paths['prc_id_photo_back'],
            'payslip_photo_path' => $paths['payslip_photo_path'],
            'role' => 'client',
            'status' => 'pending',
        ];

        // Create user
        $user = AppUser::create($userData);

        // Redirect SPA to login after successful registration
        return response()->json([
            'message' => 'Registration successful',
            'redirect_to' => '/login',
        ], 201);
    }
}
