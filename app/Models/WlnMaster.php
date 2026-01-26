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
     * Disabled when:
     * - balance is greater than zero (still owes money), OR
     * - product typecode does not exist in wln_product_tags (typecode mismatch)
     * 
     * Enabled when:
     * - balance = 0 (paid off) AND typecode matches a product
     */
    public function getIsRenewDisabledAttribute(): bool
    {
        // Check if balance is greater than zero (must be 0 or less to enable renewal)
        $balance = $this->balance;
        if ($balance && $balance > 0) {
            return true;
        }

        // Check if typecode matches any product tag typecode
        // If the wlnmaster typecode doesn't match any wln_product_tags typecode, disable renewal
        if (!$this->typecode) {
            return true;
        }

        // Query to check if there's a matching typecode in wln_product_tags
        $hasMatchingTag = \Illuminate\Support\Facades\DB::connection('sqlsrv')
            ->table('wln_product_tags')
            ->where('typecode', $this->typecode)
            ->exists();

        return !$hasMatchingTag;
    }
}
