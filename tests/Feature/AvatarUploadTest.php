<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\AppUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    Storage::fake('r2');
    config(['filesystems.default' => 'r2']);
    config(['session.driver' => 'array']);
    withoutMiddleware(HandleInertiaRequests::class);

    Schema::disableForeignKeyConstraints();
    Schema::dropIfExists('app_user_table');
    Schema::enableForeignKeyConstraints();

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

    Schema::create('wsalary_records', function (Blueprint $table) {
        $table->string('acctno')->primary();
        $table->decimal('salary_amount', 12, 2)->nullable();
        $table->timestamps();
    });
});

it('stores the avatar on the configured media disk', function () {
    $user = AppUser::factory()->create([
        'profile_picture_path' => 'avatars/old-avatar.png',
    ]);

    Storage::disk('r2')->put('avatars/old-avatar.png', 'old-avatar');

    actingAs($user);

    $response = post('/profile/avatar', [
        'avatar' => UploadedFile::fake()->image('avatar.png'),
    ]);

    $response->assertRedirect();

    $user->refresh();

    expect($user->profile_picture_path)->not->toBeNull();
    Storage::disk('r2')->assertExists($user->profile_picture_path);
    Storage::disk('r2')->assertMissing('avatars/old-avatar.png');
});
