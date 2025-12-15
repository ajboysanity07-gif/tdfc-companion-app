<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WlntypeTagsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            ['lntype' => 'BONUS-YEBL',             'lntags' => 'BONUS-YEBL'],
            ['lntype' => 'BECL',                   'lntags' => 'BECL'],
            ['lntype' => 'COLLECTION AGENCY',      'lntags' => 'CA'],
            ['lntype' => 'L/R-REM',                'lntags' => 'LR-R'],
            ['lntype' => 'L/R-CHATTEL',            'lntags' => 'LR-C'],
            ['lntype' => 'BONUS-PBB',              'lntags' => 'BONUS-PBB'],
            ['lntype' => 'SALARY LOAN',            'lntags' => 'SAL'],
            ['lntype' => 'HONORARIUM LOAN',        'lntags' => 'HON'],
            ['lntype' => 'PENSION LOAN',           'lntags' => 'PEN'],
            ['lntype' => 'GROUP LOAN',             'lntags' => 'GRP'],
            ['lntype' => 'EMERGENCY LOAN',         'lntags' => 'EMG'],
            ['lntype' => 'WRITTEN OFF',            'lntags' => 'WO'],
            ['lntype' => 'ATM REGULAR LOAN-H',     'lntags' => 'ATM-H'],
            ['lntype' => 'ATM REGULAR LOAN-E',     'lntags' => 'ATM-E'],
            ['lntype' => 'RESTRUCTURED LOAN-ATM',  'lntags' => 'R-ATM'],
            ['lntype' => 'OTHER LOAN',             'lntags' => 'OTH'],
            ['lntype' => 'INDIVIDUAL LOAN',        'lntags' => 'IND'],
            ['lntype' => 'RESTRUCTURED LOAN-APDS', 'lntags' => 'R-APDS'],
            ['lntype' => 'APDS LOAN',              'lntags' => 'APDS'],
            ['lntype' => 'BONUS-MYBL',             'lntags' => 'BONUS-MYBL'],
            ['lntype' => 'MY2EBL',                 'lntags' => 'MY2EL'],
        ];

        foreach ($rows as $row) {
            DB::table('wlntype')
                ->where('lntype', $row['lntype'])
                ->update(['lntags' => $row['lntags']]);
        }
    }
}
