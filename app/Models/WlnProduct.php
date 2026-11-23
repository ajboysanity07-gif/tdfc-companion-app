<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnProduct extends Model
{
    protected $table = 'wlnproducts';

    // Columns the admin form sends under `settings`.
    public const SETTINGS = [
        'ln_isActive', 'ln_scheme', 'installment_mode', 'rate_isEditable', 'allow_multiple',
        'max_term', 'max_term_isEditable', 'max_amortization', 'max_amortization_isEditable',
        'service_fee', 'lrf', 'doc_stamp', 'mort_notarial', 'terms_and_info',
    ];

    protected $fillable = ['typecode', 'lntype', 'int_rate', 'isDisplayed', ...self::SETTINGS];

    protected $appends = ['settings'];

    protected $casts = [
        'ln_isActive' => 'boolean',
        'isDisplayed' => 'boolean',
        'rate_isEditable' => 'boolean',
        'allow_multiple' => 'boolean',
        'max_term_isEditable' => 'boolean',
        'max_amortization_isEditable' => 'boolean',
    ];

    // Keeps the nested `settings` JSON shape the frontend already reads.
    public function getSettingsAttribute(): array
    {
        return $this->only(self::SETTINGS);
    }

    public function tags()
    {
        return $this->hasMany(WlnTags::class, 'typecode', 'typecode');
    }
}
