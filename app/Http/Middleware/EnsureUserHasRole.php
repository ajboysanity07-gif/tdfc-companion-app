<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check authentication
        if (!$request->user()) {
            Log::warning('Unauthorized access attempt', [
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
            ]);
            return redirect()->route('login');
        }

        $user = $request->user();
        $userRole = $user->role;

        // Check role authorization
        if (!in_array($userRole, $roles)) {
            Log::warning('Role-based access denied', [
                'user_id' => $user->id,
                'user_role' => $userRole,
                'required_roles' => $roles,
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
            ]);
            
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
