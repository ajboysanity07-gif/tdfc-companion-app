<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // $this->call(ReasonListSeeder::class);
        // // or fully qualified if it fails:
        // $this->call(\Database\Seeders\ReasonListSeeder::class);
        $this->call(AdminUserSeeder::class);
        $this->call(WlnDisplaySeeder::class);
        $this->call(WlntypeTagsSeeder::class);
    }
}
