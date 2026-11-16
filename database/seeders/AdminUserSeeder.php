<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AppUser;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        AppUser::updateOrCreate(
            ['email' => 'admin@tdfc.net'], // Set your admin email
            [
                'acctno' => null, // <-- MUST be null, not AD0001, not anything else
                'password' => bcrypt('Admin@T3mp123!'), // Set your password
                'role' => 'admin',
                'status' => 'approved',
                'profile_picture_path' => null // Leave null to use default
            ]
        );
    }
}
