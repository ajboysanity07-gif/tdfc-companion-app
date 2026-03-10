<?php

use App\Models\AppUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    Storage::fake('public');

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

it('renders the registration screen', function () {
    get('/register')->assertOk();
});

it('registers a new user', function () {
    $payload = [
        'acctno' => '123456',
        'fullname' => 'Test User',
        'phoneno' => '09123456789',
        'email' => 'test@example.com',
        'username' => 'testuser',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'payslipphoto' => UploadedFile::fake()->image('payslip.jpg'),
    ];

    $response = post('/register', $payload, ['Accept' => 'application/json']);

    $response->assertCreated()
        ->assertJsonPath('redirect_to', '/login');

    expect(AppUser::where('email', 'test@example.com')->exists())->toBeTrue();
});
