<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Upload user avatar.
     */
    public function uploadAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();
        $disk = $this->mediaDisk();

        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($user->profile_picture_path) {
                try {
                    Storage::disk($disk)->delete($user->profile_picture_path);
                } catch (\Throwable $e) {
                    Log::warning('Failed to delete old avatar.', [
                        'path' => $user->profile_picture_path,
                        'disk' => $disk,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Store the new avatar
            try {
                $avatarPath = $request->file('avatar')->store('avatars', ['disk' => $disk]);
            } catch (\Throwable $exception) {
                Log::warning('Avatar upload failed', [
                    'disk' => $disk,
                    'exception_class' => $exception::class,
                    'exception' => $exception->getMessage(),
                ]);

                throw ValidationException::withMessages([
                    'avatar' => 'Avatar upload failed. Please try again.',
                ]);
            }

            if (! $avatarPath) {
                Log::warning('Avatar upload path missing', [
                    'disk' => $disk,
                ]);

                throw ValidationException::withMessages([
                    'avatar' => 'Avatar upload failed. Please try again.',
                ]);
            }

            // Update user avatar path
            $user->profile_picture_path = $avatarPath;
            $user->save();

            return back()->with('success', 'Avatar updated successfully!');
        }

        return back()->with('error', 'Failed to upload avatar.');
    }

    private function mediaDisk(): string
    {
        return (string) config('filesystems.default', 'public');
    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $userId = Auth::id();

        $validated = $request->validate([
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('app_user_table', 'email')->ignore($userId, 'user_id'),
            ],
            'username' => [
                'sometimes',
                'string',
                'min:3',
                'max:30',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('app_user_table', 'username')->ignore($userId, 'user_id'),
            ],
            'name' => 'sometimes|string|max:255', // Add if you have a name field
        ]);

        $updates = collect($validated)
            ->map(fn ($value) => is_string($value) ? trim($value) : $value)
            ->filter(fn ($value) => $value !== null && $value !== '')
            ->all();

        if (empty($updates)) {
            return back()->with('success', 'Profile updated successfully');
        }

        // Update using AppUser model with correct primary key
        AppUser::where('user_id', $userId)->update($updates);

        return back()->with('success', 'Profile updated successfully');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
