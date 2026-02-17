<?php

use App\Models\AppUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

beforeEach(function () {
    Schema::disableForeignKeyConstraints();
    Schema::dropIfExists('personal_access_tokens');
    Schema::dropIfExists('app_user_table');
    Schema::dropIfExists('wmaster');
    Schema::enableForeignKeyConstraints();

    Schema::create('wmaster', function (Blueprint $table) {
        $table->string('acctno', 6)->primary();
        $table->string('bname')->nullable();
        $table->string('email_address')->nullable();
        $table->string('lname')->nullable();
        $table->timestamps();
    });

    Schema::create('app_user_table', function (Blueprint $table) {
        $table->id('user_id');
        $table->string('acctno', 6)->nullable()->index();
        $table->string('phone_no', 11)->nullable()->unique();
        $table->string('email')->unique();
        $table->string('username', 50)->nullable()->unique();
        $table->string('password');
        $table->string('profile_picture_path')->nullable();
        $table->string('prc_id_photo_front')->nullable();
        $table->string('prc_id_photo_back')->nullable();
        $table->string('payslip_photo_path')->nullable();
        $table->string('role', 20)->default('client')->index();
        $table->string('status', 20)->default('pending');
        $table->dateTime('reviewed_at')->nullable();
        $table->unsignedBigInteger('reviewed_by')->nullable();
        $table->dateTime('rejected_at')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('personal_access_tokens', function (Blueprint $table) {
        $table->id();
        $table->string('tokenable_type');
        $table->unsignedBigInteger('tokenable_id');
        $table->string('name');
        $table->string('token', 64)->unique();
        $table->text('abilities')->nullable();
        $table->timestamp('last_used_at')->nullable();
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
        $table->index(['tokenable_type', 'tokenable_id']);
    });
});

it('requires a unique username when registering', function () {
    AppUser::factory()->create([
        'username' => 'clientuser',
        'email' => 'client@example.com',
        'phone_no' => '09999999999',
        'password' => Hash::make('secret123'),
    ]);

    $payload = [
        'accntno' => '123456',
        'fullname' => 'Test User',
        'phoneno' => '09123456789',
        'email' => 'new@example.com',
        'username' => 'clientuser',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = postJson('/api/register', $payload);

    $response->assertStatus(422)->assertJsonValidationErrors(['username']);

    $payload['username'] = 'fresh_user';
    $payload['email'] = 'fresh@example.com';
    $payload['phoneno'] = '09111111111';

    $response = postJson('/api/register', $payload);

    $response->assertCreated();
    expect(AppUser::where('username', 'fresh_user')->exists())->toBeTrue();
});

it('returns username availability and suggestions', function () {
    AppUser::factory()->create([
        'username' => 'janedoe',
        'email' => 'jane@example.com',
        'phone_no' => '09100000000',
    ]);

    getJson('/api/check-register-duplicate?username=uniqueuser')
        ->assertOk()
        ->assertJsonPath('usernameExists', false);

    getJson('/api/check-register-duplicate?username=janedoe')
        ->assertOk()
        ->assertJsonPath('usernameExists', true);

    $response = getJson('/api/check-register-duplicate?username=janedoe&full_name=Jane Doe&email=jane.doe@example.com');

    $response->assertOk();

    $suggestions = $response->json('suggestions');

    expect($response->json('usernameExists'))->toBeTrue();
    expect($suggestions)->toBeArray()->not->toBeEmpty();
    expect(collect($suggestions)->contains('janedoe'))->toBeFalse();
    expect(count($suggestions))->toBe(count(collect($suggestions)->unique()));
});

it('logs in with email or username', function () {
    $password = 'P@ssword123';
    $user = AppUser::factory()->create([
        'username' => 'loginuser',
        'email' => 'login@example.com',
        'phone_no' => '09122222222',
        'password' => Hash::make($password),
    ]);

    $emailLogin = postJson('/api/login', [
        'login' => 'login@example.com',
        'password' => $password,
    ]);

    $emailLogin->assertOk()->assertJsonPath('user.user_id', $user->getKey());

    $usernameLogin = postJson('/api/login', [
        'login' => 'loginuser',
        'password' => $password,
    ]);

    $usernameLogin->assertOk()->assertJsonPath('user.user_id', $user->getKey());
    expect($usernameLogin->json('token'))->not->toBeEmpty();
});
