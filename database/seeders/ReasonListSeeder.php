<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RejectionReason;

class ReasonListSeeder extends Seeder
{
    public function run()
    {
        $reasons = [
            [ 'code' => 'prc_id_blurry', 'label' => 'PRC ID photo is blurry' ],
            [ 'code' => 'not_prc_id', 'label' => 'The ID photo submitted is not a PRC ID' ],
            [ 'code' => 'prc_id_expired', 'label' => 'PRC ID is expired' ],
            [ 'code' => 'payslip_blurry', 'label' => 'Payslip photo is blurry' ],
            [ 'code' => 'payslip_too_old', 'label' => 'Payslip is too old (more than 3 months)' ],
            [ 'code' => 'documents_tampered', 'label' => 'Documents appear to be tampered' ],
        ];

        foreach ($reasons as $reason) {
            RejectionReason::create($reason);
        }
    }
}
