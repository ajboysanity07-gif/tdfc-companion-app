<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnProducts extends Model
{
    public const MODE_FIXED = 'FIXED';
    public const MODE_BASIC = 'BASIC';
    public const MODE_CUSTOM = 'CUSTOM';

    protected $table = 'wln_products';
    protected $primaryKey = 'product_id';
    public $timestamps = true;

    protected $fillable = [
        'product_name',
        'is_active',
        'is_multiple',
        'schemes',
        'mode',
        'interest_rate',
        'max_term_days',
        'is_max_term_editable',
        'max_amortization_mode',      // new
        'max_amortization_formula',
        'max_amortization',
        'is_max_amortization_editable',
        'service_fee',
        'lrf',
        'document_stamp',
        'mort_plus_notarial',
        'terms'
    ];
    protected $casts = [
        'is_active' => 'boolean',
        'is_multiple' => 'boolean',
        'is_max_term_editable' => 'boolean',
        'is_max_amortization_editable' => 'boolean'

    ];

    protected $appends = ['max_term_months'];

    /**
     * Accessor for max_term_months (computed from max_term_days).
     */
    public function getMaxTermMonthsAttribute(): int
    {
        return $this->max_term_days ? (int) floor($this->max_term_days / 30) : 0;
    }

    public function tags()
    {
        return $this->hasMany(WlnProductTags::class, 'product_id', 'product_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function types()
    {
        // Keep pivot timestamps in sync when attaching/detaching types
        return $this->belongsToMany(WlnType::class, 'wln_product_tags', 'product_id', 'typecode', 'product_id', 'typecode');
            // ->withTimestamps();
    }
}
