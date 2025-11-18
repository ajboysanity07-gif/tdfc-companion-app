<?php

// namespace App\Http\Middleware;

// use Illuminate\Foundation\Inspiring;
// use Illuminate\Http\Request;
// use Inertia\Middleware;
// use Tighten\Ziggy\Ziggy;

// class HandleInertiaRequests extends Middleware
// {
//     /**
//      * The root template that's loaded on the first page visit.
//      *
//      * @see https://inertiajs.com/server-side-setup#root-template
//      *
//      * @var string
//      */
//     protected $rootView = 'app';

//     /**
//      * Determines the current asset version.
//      *
//      * @see https://inertiajs.com/asset-versioning
//      */
//     public function version(Request $request): ?string
//     {
//         return parent::version($request);
//     }

//     /**
//      * Define the props that are shared by default.
//      *
//      * @see https://inertiajs.com/shared-data
//      *
//      * @return array<string, mixed>
//      */
//     public function share(Request $request): array
//     {
//         [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

//         return [
//             ...parent::share($request),
//             'name' => config('app.name'),
//             'quote' => ['message' => trim($message), 'author' => trim($author)],
//             'auth' => [
//                 'user' => $request->user(),
//             ],
//             'ziggy' => fn (): array => [
//                 ...(new Ziggy)->toArray(),
//                 'location' => $request->url(),
//             ],
//             'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
//         ];
//     }
// }

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
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

        $authUser = $user ? [
            'id'     => $user->user_id ?? $user->id ?? null,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role ?? 'customer',
            'avatar' => $user->profile_picture_path ? asset('storage/'.$user->profile_picture_path) : null,
        ] : null;

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
