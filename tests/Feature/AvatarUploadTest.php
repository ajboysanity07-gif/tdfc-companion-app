<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('stores the avatar on the configured media disk', function () {
    Storage::fake('r2');
    config(['filesystems.avatar_disk' => 'r2']);

    $user = $this->member(['profile_picture_path' => 'avatars/old-avatar.png']);

    Storage::disk('r2')->put('avatars/old-avatar.png', 'old-avatar');

    $response = $this->actingAs($user)->post('/profile/avatar', [
        'avatar' => UploadedFile::fake()->image('avatar.png'),
    ]);

    $response->assertRedirect();

    $user->refresh();

    expect($user->profile_picture_path)->not->toBeNull();
    Storage::disk('r2')->assertExists($user->profile_picture_path);
    Storage::disk('r2')->assertMissing('avatars/old-avatar.png');
});
