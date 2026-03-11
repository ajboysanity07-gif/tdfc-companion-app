<?php

namespace App\Http\Middleware;

use App\Repositories\Client\LoanRepository;
use App\Services\Client\LoanClassificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user(); // App\Models\AppUser|null

        $authUser = null;
        if ($user) {
            // Fetch salary record
            $salaryRecord = $user->acctno ? \App\Models\WSalaryRecord::where('acctno', $user->acctno)->first() : null;

            // Calculate loan class using LoanClassificationService
            $loanClass = null;
            if ($user->acctno) {
                $loanRepository = app(LoanRepository::class);
                $loanClassificationService = app(LoanClassificationService::class);
                $loanRows = $loanRepository->getLoanRowsGroupedByAccounts([$user->acctno]);
                $loanClass = $loanClassificationService->classify($loanRows->get($user->acctno));
            }

            // Build avatar URL from the active filesystem disk.
            $avatarUrl = null;
            if ($user->profile_picture_path) {
                $avatarUrl = $this->resolveMediaUrl($user->profile_picture_path);
            }

            $authUser = [
                'id' => $user->user_id ?? $user->id ?? null,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role ?? 'client',
                'acctno' => $user->acctno ?? null,
                'avatar' => $avatarUrl,
                'salary_amount' => $salaryRecord ? (float) $salaryRecord->salary_amount : null,
                'class' => $loanClass,
            ];
        }

        return [
            ...parent::share($request),

            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],

            'auth' => [
                'user' => $authUser,
            ],

            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],

            'sidebarOpen' => ! $request->hasCookie('sidebar_state')
                || $request->cookie('sidebar_state') === 'true',
        ];
    }

    private function resolveMediaUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $disk = (string) config('filesystems.default', 'public');

        try {
            $storage = Storage::disk($disk);

            if (! $storage->exists($path)) {
                return null;
            }

            return $storage->url($path);
        } catch (\Throwable $exception) {
            Log::warning('Failed to resolve auth avatar URL', [
                'path' => $path,
                'disk' => $disk,
                'exception_class' => $exception::class,
                'exception' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}
