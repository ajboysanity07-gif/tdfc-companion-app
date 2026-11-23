<?php

namespace App\Http\Middleware;

use App\Models\AppUser;
use Closure;
use Illuminate\Http\Request;

/** view_as:member — admins only pass while viewing a member. view_as:admin — drop any view-as. */
class ViewAsMember
{
    public function handle(Request $request, Closure $next, string $scope)
    {
        if ($scope === 'admin') {
            $request->session()->forget('view_as');
        } else {
            abort_if($request->user()->isAdmin() && AppUser::effective($request)->isAdmin(), 403);
        }

        return $next($request);
    }
}
