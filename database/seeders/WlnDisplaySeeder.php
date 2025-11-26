<?php

namespace Database\Seeders;

use App\Models\WlnDisplay;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WlnDisplaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $lnDisplay = [
            ['typecode' => '1', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '2', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '3', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '4', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '5', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '6', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '7', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '8', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '9', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '10', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '11', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '12', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '13', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '14', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '15', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '16', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '17', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '18', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '19', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '20', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '21', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],
            ['typecode' => '22', 'isDisplayed' => false, 'created_at' => now(), 'updated_at' => now()],

        ];

        foreach ($lnDisplay as $display) {
            WlnDisplay::create($display);
        }
    }
}
