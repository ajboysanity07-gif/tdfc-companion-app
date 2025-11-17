<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnSettings extends Model
{
    protected $fillable = [
        'typecode', 'ln_isActive', 'ln_scheme', 'max_term', 'max_term_isEditable',
        'max_amortization', 'max_amortization_isEditable', 'service_fee', 'lrf',
        'doc_stamp', 'mort_notarial', 'terms_and_info'
    ];

    public function type() { return $this->belongsTo(WlnType::class, 'typecode', 'typecode'); }
}
