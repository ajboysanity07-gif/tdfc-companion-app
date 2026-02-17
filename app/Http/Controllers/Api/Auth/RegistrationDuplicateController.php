<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckRegistrationDuplicateRequest;
use App\Models\AppUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class RegistrationDuplicateController extends Controller
{
    public function __invoke(CheckRegistrationDuplicateRequest $request): JsonResponse
    {
        $accntnoExists = false;
        $emailExists = false;
        $phoneExists = false;
        $usernameExists = false;

        if ($request->filled('accntno')) {
            $accntnoExists = AppUser::where('acctno', $request->string('accntno'))->exists();
        }

        if ($request->filled('email')) {
            $email = strtolower($request->string('email')->toString());
            $emailExists = AppUser::whereRaw('LOWER(email) = ?', [$email])->exists();
        }

        if ($request->filled('phone_no')) {
            $phoneExists = AppUser::where('phone_no', $request->string('phone_no'))->exists();
        }

        if ($request->filled('username')) {
            $username = strtolower($request->string('username')->toString());
            $usernameExists = AppUser::whereRaw('LOWER(username) = ?', [$username])->exists();
        }

        $suggestions = $this->availableSuggestions($request);

        return response()->json([
            'accntnoExists' => $accntnoExists,
            'emailExists' => $emailExists,
            'phoneExists' => $phoneExists,
            'usernameExists' => $usernameExists,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Build a list of available username suggestions based on user input.
     */
    private function availableSuggestions(CheckRegistrationDuplicateRequest $request): array
    {
        $candidates = $this->buildCandidates($request);

        if ($candidates->isEmpty()) {
            return [];
        }

        $available = $candidates->filter(function (string $candidate): bool {
            return ! AppUser::whereRaw('LOWER(username) = ?', [strtolower($candidate)])->exists();
        });

        return $available->take(6)->values()->all();
    }

    private function buildCandidates(CheckRegistrationDuplicateRequest $request): Collection
    {
        $candidates = collect();

        $username = $this->sanitizeCandidate($request->string('username')->toString());
        $emailLocal = $this->sanitizeCandidate(Str::of($request->string('email'))->before('@')->toString());
        $fullName = Str::of($request->string('full_name'))->squish();
        $firstName = $this->sanitizeCandidate($fullName->explode(' ')->first());
        $lastName = $this->sanitizeCandidate($fullName->explode(' ')->last());
        $acctSuffix = $this->sanitizeCandidate($request->string('accntno')->substr(-3)->toString());

        if ($username) {
            $candidates->push($username, "{$username}1", "{$username}123");
        }

        if ($emailLocal) {
            $candidates->push($emailLocal, "{$emailLocal}01", "{$emailLocal}2025");
        }

        if ($firstName && $lastName) {
            $candidates->push(
                "{$firstName}{$lastName}",
                "{$firstName}.{$lastName}",
                "{$firstName}_{$lastName}"
            );
        } elseif ($firstName) {
            $candidates->push($firstName, "{$firstName}01");
        }

        if ($firstName && $acctSuffix) {
            $candidates->push("{$firstName}{$acctSuffix}");
        } elseif ($emailLocal && $acctSuffix) {
            $candidates->push("{$emailLocal}{$acctSuffix}");
        }

        return $candidates
            ->map(fn (string $candidate) => $this->sanitizeCandidate($candidate))
            ->filter()
            ->unique()
            ->values();
    }

    private function sanitizeCandidate(string $candidate): ?string
    {
        $clean = preg_replace('/[^A-Za-z0-9._-]/', '', strtolower($candidate ?? ''));
        $clean = Str::of($clean)->substr(0, 30)->toString();

        return strlen($clean) >= 3 ? $clean : null;
    }
}
