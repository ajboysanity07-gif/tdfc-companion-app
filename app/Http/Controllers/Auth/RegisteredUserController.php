<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterAppUserRequest;
use App\Models\AppUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class RegisteredUserController extends Controller
{
    public function store(RegisterAppUserRequest $request): JsonResponse
    {
        $logContext = $this->buildLogContext($request);
        $disk = $this->mediaDisk();

        Log::info('Registration request received', $logContext + [
            'milestone' => 'received',
        ]);

        $request->validated();

        Log::info('Registration request validated', $logContext + [
            'milestone' => 'validated',
        ]);

        $storedPaths = [
            'profile_picture_path' => null,
            'prc_id_photo_front' => null,
            'prc_id_photo_back' => null,
            'payslip_photo_path' => null,
        ];

        try {
            [$user, $storedPaths] = DB::transaction(function () use ($request, $disk) {
                $storedPaths = $this->storeUploads($request, $disk);

                $userData = [
                    'acctno' => $request->string('acctno')->toString(),
                    'phone_no' => $request->string('phoneno')->toString(),
                    'email' => strtolower(trim($request->string('email')->toString())),
                    'username' => strtolower(trim($request->string('username')->toString())),
                    'password' => Hash::make($request->input('password')),
                    'profile_picture_path' => $storedPaths['profile_picture_path'],
                    'prc_id_photo_front' => $storedPaths['prc_id_photo_front'],
                    'prc_id_photo_back' => $storedPaths['prc_id_photo_back'],
                    'payslip_photo_path' => $storedPaths['payslip_photo_path'],
                    'role' => 'client',
                    'status' => 'pending',
                ];

                $user = AppUser::create($userData);

                return [$user, $storedPaths];
            });

            Log::info('Registration completed', $logContext + [
                'milestone' => 'completed',
                'user_id' => $user->getKey(),
            ]);

            return response()->json([
                'message' => 'Registration successful',
                'redirect_to' => '/login',
            ], 201);
        } catch (ValidationException $exception) {
            $this->cleanupStoredFiles($storedPaths, $disk);

            Log::warning('Registration validation failed', $logContext + [
                'milestone' => 'validation_failed',
                'error_fields' => array_keys($exception->errors()),
            ]);

            throw $exception;
        } catch (Throwable $exception) {
            $this->cleanupStoredFiles($storedPaths, $disk);

            Log::error('Registration failed', $logContext + [
                'milestone' => 'failed',
                'exception_class' => $exception::class,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Registration failed. Please try again later.',
            ], 500);
        }
    }

    /**
     * @return array{
     *     route_name: string|null,
     *     route_uri: string|null,
     *     path: string,
     *     method: string,
     *     admin_mode: bool,
     *     acctno: string|null,
     *     email: string|null,
     *     ip: string|null,
     *     user_agent: string|null,
     *     uploads: array{
     *         profile_picture: bool,
     *         prc_front: bool,
     *         prc_back: bool,
     *         payslip: bool
     *     }
     * }
     */
    private function buildLogContext(RegisterAppUserRequest $request): array
    {
        $route = $request->route();

        return [
            'route_name' => $route?->getName(),
            'route_uri' => $route?->uri(),
            'path' => $request->path(),
            'method' => $request->method(),
            'admin_mode' => $request->boolean('admin_registration'),
            'acctno' => $request->input('acctno'),
            'email' => $request->input('email'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'uploads' => [
                'profile_picture' => $request->hasFile('profilepicture'),
                'prc_front' => $request->hasFile('prcidphotofront'),
                'prc_back' => $request->hasFile('prcidphotoback'),
                'payslip' => $request->hasFile('payslipphoto'),
            ],
        ];
    }

    /**
     * @return array{
     *     profile_picture_path: string|null,
     *     prc_id_photo_front: string|null,
     *     prc_id_photo_back: string|null,
     *     payslip_photo_path: string|null
     * }
     *
     * @throws ValidationException
     */
    private function storeUploads(RegisterAppUserRequest $request, string $disk): array
    {
        $paths = [
            'profile_picture_path' => null,
            'prc_id_photo_front' => null,
            'prc_id_photo_back' => null,
            'payslip_photo_path' => null,
        ];

        $fileFields = [
            'profile_picture_path' => 'profilepicture',
            'prc_id_photo_front' => 'prcidphotofront',
            'prc_id_photo_back' => 'prcidphotoback',
            'payslip_photo_path' => 'payslipphoto',
        ];

        foreach ($fileFields as $pathKey => $field) {
            if (! $request->hasFile($field)) {
                continue;
            }

            try {
                $path = $request->file($field)?->storePublicly('uploads', ['disk' => $disk]);
            } catch (Throwable $exception) {
                Log::warning('Registration upload failed', [
                    'field' => $field,
                    'disk' => $disk,
                    'exception_class' => $exception::class,
                    'exception' => $exception->getMessage(),
                ]);
                throw ValidationException::withMessages([
                    $field => 'Upload failed. Please try again.',
                ]);
            }

            if (! $path) {
                Log::warning('Registration upload path missing', [
                    'field' => $field,
                    'disk' => $disk,
                ]);
                throw ValidationException::withMessages([
                    $field => 'Upload failed. Please try again.',
                ]);
            }

            $paths[$pathKey] = $path;
        }

        return $paths;
    }

    /**
     * @param  array<string, string|null>  $storedPaths
     */
    private function cleanupStoredFiles(array $storedPaths, string $disk): void
    {
        $pathsToDelete = array_values(array_filter($storedPaths));

        if ($pathsToDelete === []) {
            return;
        }

        try {
            Storage::disk($disk)->delete($pathsToDelete);
        } catch (Throwable $exception) {
            Log::warning('Registration cleanup failed', [
                'paths' => $pathsToDelete,
                'disk' => $disk,
                'exception_class' => $exception::class,
                'exception' => $exception->getMessage(),
            ]);
        }
    }

    private function mediaDisk(): string
    {
        return (string) config('filesystems.default', 'public');
    }
}
