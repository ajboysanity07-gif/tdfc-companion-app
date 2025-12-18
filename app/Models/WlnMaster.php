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

    public function appUser(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'acctno', 'acctno');
    }
}
