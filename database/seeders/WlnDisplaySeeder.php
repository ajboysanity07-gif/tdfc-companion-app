<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WlnDisplaySeeder extends Seeder
{
    public function run()
    {
        $typecodes = [
            '14','15','16','17','18','20','03','04','05','06','07','08',
            '09','10','11','13','02','01','19','21','22'
        ];

        $now = Carbon::now();

        foreach ($typecodes as $typecode) {
            DB::table('wln_display')->updateOrInsert(
                ['typecode' => $typecode],
                [
                    'isDisplayed' => true,
                    'created_at' => $now,
                    'updated_at' => $now
                ]
            );
        }
    }
}
