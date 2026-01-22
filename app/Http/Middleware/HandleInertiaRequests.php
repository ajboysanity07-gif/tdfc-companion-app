<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Services\Client\LoanClassificationService;
use App\Repositories\Client\LoanRepository;

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
            
            // Extract filename from profile_picture_path and use public/images/ directory
            // This ensures avatars are loaded from git-tracked location for both admin and client users
            $avatarUrl = null;
            if ($user->profile_picture_path) {
                $filename = basename($user->profile_picture_path);
                $avatarUrl = asset('images/' . $filename);
            }
            
            $authUser = [
                'id'            => $user->user_id ?? $user->id ?? null,
                'name'          => $user->name,
                'email'         => $user->email,
                'role'          => $user->role ?? 'client',
                'acctno'        => $user->acctno ?? null,
                'avatar'        => $avatarUrl,
                'salary_amount' => $salaryRecord ? (float) $salaryRecord->salary_amount : null,
                'class'         => $loanClass,
            ];
        }

        return [
            ...parent::share($request),

            'name'  => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],

            'auth'  => [
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
}
