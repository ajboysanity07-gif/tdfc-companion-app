<?php

namespace Tests\Feature\Auth;

use App\Models\AppUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function form(array $overrides = []): array
    {
        return $overrides + [
            'accntno' => '000001',
            'phone_no' => '09170000001',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'prc_id_photo_front' => UploadedFile::fake()->image('front.jpg'),
            'prc_id_photo_back' => UploadedFile::fake()->image('back.jpg'),
        ];
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_are_registered_and_stay_logged_in()
    {
        Storage::fake('public');
        $this->wmaster('000001');

        $this->post('/register', $this->form())
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('customer.registration.status'));

        $this->assertSame('pending', AppUser::where('email', 'test@example.com')->value('status'));
        $this->assertNotNull(Auth::id());

        // the next request must find the user again from the session
        Auth::forgetGuards();
        $this->get(route('customer.registration.status'))->assertOk();
    }

    public function test_registration_needs_an_account_number()
    {
        $this->wmaster();

        $this->post('/register', $this->form(['accntno' => '']))->assertSessionHasErrors('accntno');
        $this->assertGuest();
    }

    public function test_registration_rejects_an_invalid_email()
    {
        $this->wmaster();

        $this->post('/register', $this->form(['email' => 'invalidEmail']))->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_registration_rejects_a_weak_password_then_accepts_a_good_one()
    {
        Storage::fake('public');
        $this->wmaster();

        $this->post('/register', $this->form(['password' => '123', 'password_confirmation' => '123']))
            ->assertSessionHasErrors('password');
        $this->assertGuest();

        $this->post('/register', $this->form())->assertSessionHasNoErrors();
        $this->assertSame(1, AppUser::count());
    }
}
