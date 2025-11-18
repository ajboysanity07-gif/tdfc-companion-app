<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterAppUserRequest;
use App\Models\AppUser;
use App\Models\Wmaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/register', [
            'adminMode' => (bool) request()->boolean('admin_registration'),
        ]);
    }

    public function store(RegisterAppUserRequest $request): RedirectResponse
    {
        $adminMode = (bool) $request->boolean('admin_registration');
        $wm = Wmaster::query()->where('acctno', $request->string('acctno'))->first();

        $role = $adminMode ? 'admin' : 'customer';
        if (!$adminMode && $wm && array_key_exists('Userrights', $wm->getAttributes())) {
            $role = ((int) $wm->getAttribute('Userrights')) === 1 ? 'admin' : 'customer';
        }

        $paths = [
            'profile_picture_path' => null,
            'prc_id_photo_front'   => null,
            'prc_id_photo_back'    => null,
            'payslip_photo_path'   => null,
        ];

        foreach (
            [
                'profile_picture'    => 'profile_picture_path',
                'prc_id_photo_front' => 'prc_id_photo_front',
                'prc_id_photo_back'  => 'prc_id_photo_back',
                'payslip_photo'      => 'payslip_photo_path'
            ] as $input => $column
        ) {
            if ($request->hasFile($input)) {
                $paths[$column] = $request->file($input)->storePublicly('uploads', ['disk' => 'public']);
            }
        }

        // Set status for new users
        $status = ($role === 'admin') ? 'approved' : 'pending';

        $user = AppUser::create([
            'acctno' => $request->string('acctno'),
            'phone_no' => $request->string('phone_no'),
            'email' => $request->string('email'),
            'password' => $request->string('password'),
            'role' => $role,
            'status' => $status,
            ...$paths,
        ]);

        // UPDATED: Always log in the user after registration
        Auth::login($user);

        // UPDATED: Redirect based on status
        if ($user->status === 'approved') {
            // Admins go to their dashboard
            return redirect()->route($user->isAdmin() ? 'admin.dashboard' : 'dashboard');
        } else {
            // Pending customers go to registration status page
            return redirect()->route('customer.registration.status');
        }
    }
}
