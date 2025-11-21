<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    /**
     * Redirect non-approved customers to registration status page
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Check if user exists and is a customer
        if ($user && $user->role === 'customer') {
            // If status is not approved, redirect to status page
            if ($user->status !== 'approved') {
                $acctno = $user->acctno ?? $request->route('acctno');
                return redirect()->route('client.registration-status', ['acctno' => $acctno]);
            }
        }
        
        return $next($request);
    }
}
