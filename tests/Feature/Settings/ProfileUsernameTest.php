<?php

use App\Models\AppUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\patch;

beforeEach(function () {
    Schema::disableForeignKeyConstraints();
    Schema::dropIfExists('app_user_table');
    Schema::dropIfExists('personal_access_tokens');
    Schema::enableForeignKeyConstraints();

    Schema::create('app_user_table', function (Blueprint $table) {
        $table->id('user_id');
        $table->string('acctno', 6)->nullable()->index();
        $table->string('phone_no', 11)->nullable()->unique();
        $table->string('email')->unique();
        $table->string('username', 50)->nullable()->unique();
        $table->string('password');
        $table->string('role', 20)->default('client')->index();
        $table->string('status', 20)->default('pending');
        $table->rememberToken();
        $table->timestamps();
    });
});

it('updates username successfully', function () {
    $user = AppUser::factory()->create([
        'acctno' => null,
        'username' => 'olduser',
        'email' => 'old@example.com',
        'password' => Hash::make('password123'),
    ]);

    actingAs($user);

    patch(route('profile.update'), [
        'username' => 'newuser',
    ])->assertRedirect();

    expect(AppUser::find($user->getKey())->username)->toBe('newuser');
});

it('rejects duplicate username', function () {
    $existing = AppUser::factory()->create([
        'acctno' => null,
        'username' => 'takenuser',
        'email' => 'taken@example.com',
        'password' => Hash::make('password123'),
    ]);

    $user = AppUser::factory()->create([
        'acctno' => null,
        'username' => 'original',
        'email' => 'user@example.com',
        'password' => Hash::make('password123'),
    ]);

    actingAs($user);

    patch(route('profile.update'), [
        'username' => $existing->username,
    ])->assertSessionHasErrors('username');

    expect(AppUser::find($user->getKey())->username)->toBe('original');
});
