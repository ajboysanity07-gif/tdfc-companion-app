<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdminRegistrationToken
{
    public function handle(Request $request, Closure $next)
    {
        $code = $request->query('code');
        $expected = config('app.admin_reg_token', env('ADMIN_REG_TOKEN'));

        if (! $code || ! $expected || ! hash_equals($expected, (string) $code)) {
            abort(404);
        }

        // Flag for controller/view
        $request->merge(['admin_registration' => true]);

        return $next($request);
    }
}
