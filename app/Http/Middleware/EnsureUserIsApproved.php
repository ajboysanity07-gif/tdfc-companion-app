<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    /**
     * Redirect non-approved clients to registration status page
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Check if user exists and is a client
        if ($user && $user->role === 'client') {
            // If status is not approved, redirect to status page
            if ($user->status !== 'approved') {
                return redirect()->route('customer.registration.status');
            }
        }
        
        return $next($request);
    }
}
