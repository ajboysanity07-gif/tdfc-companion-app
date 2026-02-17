<?php

namespace Database\Factories;

use App\Models\AppUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AppUser>
 */
class AppUserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'acctno' => fake()->unique()->numerify('######'),
            'phone_no' => fake()->unique()->numerify('09#########'),
            'email' => fake()->unique()->safeEmail(),
            'username' => strtolower(fake()->unique()->userName()),
            'password' => Hash::make('password'),
            'role' => 'client',
            'status' => AppUser::STATUS_PENDING,
            'remember_token' => Str::random(10),
        ];
    }
}
