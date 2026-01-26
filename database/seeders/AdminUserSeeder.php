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
        AppUser::updateOrCreate(
            ['email' => 'beethovenbalaba@gmail.com'], // Set your admin email
            [
                'password' => bcrypt('@T3mp123!'), // Set your password
                'role' => 'client',
            ]
        );
        AppUser::updateOrCreate(
            ['email' => 'fedelfinado@gmail.com'], // Set your admin email
            [
                'password' => bcrypt('@T3mp123!'), // Set your password
                'role' => 'client',
            ]
        );
        AppUser::updateOrCreate(
            ['email' => 'joceilynajero@gmail.com'], // Set your admin email
            [
                'password' => bcrypt('@T3mp123!'), // Set your password
                'role' => 'client',
            ]
        );
        AppUser::updateOrCreate(
            ['email' => 'gemaechaves@gmail.com'], // Set your admin email
            [
                'password' => bcrypt('@T3mp123!'), // Set your password
                'role' => 'client',
            ]
        );
        AppUser::updateOrCreate(
            ['email' => 'annalouteves@gmail.com'], // Set your admin email
            [
                'password' => bcrypt('@T3mp123!'), // Set your password
                'role' => 'client',
            ]
        );
        AppUser::updateOrCreate(
            ['email' => 'queneemantes@gmail.com'], // Set your admin email
            [
                'password' => bcrypt('@T3mp123!'), // Set your password
                'role' => 'client',
            ]
        );
    }
}
