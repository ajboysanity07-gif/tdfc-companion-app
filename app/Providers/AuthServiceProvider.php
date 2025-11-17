<?php

namespace App\Providers;

use App\Models\AppUser;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // ...
    ];

    public function boot(): void
    {
        Gate::define('admin', function (AppUser $user) {
            return $user->role === 'admin';
        });
    }
}
