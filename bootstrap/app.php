<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\EnsureUserHasRole;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register web middleware
        $middleware->web(\App\Http\Middleware\HandleInertiaRequests::class);

        // ✅ Sanctum SPA stateful middleware for API requests!
        $middleware->api(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);

        // Register middleware aliases
        $middleware->alias([
            'approved' => \App\Http\Middleware\EnsureUserIsApproved::class,
            'role' => EnsureUserHasRole::class,
            'admin.reg.token' => \App\Http\Middleware\EnsureAdminRegistrationToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // ✅ FIXED: Correct parameter order
        $exceptions->respond(function ($response, $exception, $request) {
            $status = $response->getStatusCode();

            // Only handle Inertia requests (skip API requests)
            if (!$request->inertia()) {
                return $response;
            }

            // Log security violations (403 errors)
            if ($status === 403) {
                Log::warning('Access denied', [
                    'user_id' => $request->user()?->id,
                    'url' => $request->fullUrl(),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }

            // Map status codes to error pages
            if (in_array($status, [403, 404, 500, 503])) {
                $errorPage = match($status) {
                    403 => 'errors/403',
                    404 => 'errors/404',
                    500, 503 => 'errors/500',
                    default => 'errors/500',
                };

                return Inertia::render($errorPage, [
                    'status' => $status
                ])->toResponse($request)->setStatusCode($status);
            }

            // Handle all other 5xx server errors
            if ($status >= 500) {
                return Inertia::render('errors/500', [
                    'status' => $status
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
