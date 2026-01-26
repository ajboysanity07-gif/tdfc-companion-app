<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WlnMaster extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'wlnmaster';
    protected $primaryKey = 'lnnumber';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];
    protected $appends = ['is_renew_disabled'];

    public function appUser(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'acctno', 'acctno');
    }

    /**
     * Determine if the Renew button should be disabled.
     * 
     * Button is ENABLED when:
     * - typecode exists AND
     * - matching product tag found with is_multiple = true
     * 
     * Button is DISABLED when:
     * - typecode is missing OR
     * - no matching product tag found OR
     * - product doesn't allow multiples (is_multiple = false)
     */
    public function getIsRenewDisabledAttribute(): bool
    {
        // Disable if no typecode
        if (!$this->typecode) {
            return true;
        }

        // Check if there's a matching typecode in wln_product_tags
        // AND the product allows multiple loans (is_multiple = true)
        $hasMatchingTag = \Illuminate\Support\Facades\DB::connection('sqlsrv')
            ->table('wln_product_tags as tags')
            ->join('wln_products as prod', 'tags.product_id', '=', 'prod.product_id')
            ->where('tags.typecode', $this->typecode)
            ->where('prod.is_multiple', true)
            ->exists();

        // Disable if:
        // - no matching tag found OR
        // - product doesn't allow multiples
        // In other words: enable ONLY if hasMatchingTag is true
        return !$hasMatchingTag;
    }
}
