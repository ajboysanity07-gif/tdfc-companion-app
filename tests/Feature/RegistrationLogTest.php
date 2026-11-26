<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Models\AppUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

test('registration log marks only submissions of pending clients', function () {
    // Wmaster pins sqlsrv: remap it so nothing can reach the remote server.
    config(['database.connections.sqlsrv' => config('database.connections.sqlite')]);
    Schema::create('app_user_table', fn (Blueprint $table) => $table->id('user_id'));

    $clients = collect(['pending', 'approved', 'rejected'])->map(function (string $status) {
        $user = (new AppUser)->forceFill(['user_id' => $status, 'email' => "$status@example.com", 'status' => $status, 'created_at' => now()]);

        // No reviewed_at: an approved client without one must not read as awaiting review.
        return $user->setRelation('wmaster', null)->setRelation('rejectionReasons', collect());
    });

    $events = (new ReflectionMethod(DashboardController::class, 'events'))->invoke(new DashboardController, $clients);

    expect($events->where('pending', true)->pluck('email')->values()->all())->toBe(['pending@example.com']);
});

test('dashboard queues pending clients oldest first and lists submissions as activity', function () {
    config(['database.connections.sqlsrv' => config('database.connections.sqlite')]);
    Schema::connection('sqlsrv')->create('wmaster', function (Blueprint $table) {
        $table->string('acctno');
        $table->string('bname');
    });
    Schema::create('app_user_table', function (Blueprint $table) {
        $table->id('user_id');
        foreach (['email', 'role', 'status', 'acctno', 'created_at', 'reviewed_at', 'reviewed_by', 'rejected_at'] as $column) {
            $table->string($column)->nullable();
        }
    });
    Schema::create('rejection_reasons', function (Blueprint $table) {
        $table->id();
        $table->string('code');
        $table->string('label');
    });
    Schema::create('app_user_rejection_reason', function (Blueprint $table) {
        $table->integer('user_id');
        $table->integer('rejection_reason_id');
    });
    Schema::create('wlnproducts', function (Blueprint $table) {
        $table->boolean('isDisplayed');
        $table->boolean('ln_isActive');
    });

    foreach (['newer' => '2026-11-10', 'older' => '2026-11-05'] as $name => $day) {
        DB::table('app_user_table')->insert(['email' => "$name@example.com", 'role' => 'client', 'status' => 'pending', 'created_at' => "$day 09:00:00"]);
    }
    DB::table('wlnproducts')->insert([
        ['isDisplayed' => true, 'ln_isActive' => true],
        ['isDisplayed' => true, 'ln_isActive' => false],
        ['isDisplayed' => false, 'ln_isActive' => true],
    ]);

    $request = Request::create('/admin/dashboard');
    $request->headers->set('X-Inertia', 'true');
    $props = (new DashboardController)->index()->toResponse($request)->getData(true)['props'];

    expect(array_column($props['pending'], 'name'))->toBe(['older', 'newer'])
        ->and(array_column($props['activity'], 'event'))->toBe(['submitted', 'submitted'])
        ->and($props['stats']['products'])->toBe(1)
        ->and($props['stats']['productsTotal'])->toBe(2);
});
