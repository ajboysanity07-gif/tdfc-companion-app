<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VWebLnled extends Model
{
    // ✅ Configure model for your database view
    protected $table = 'VWeb_Lnled';
    protected $primaryKey = 'lnnumber';
    public $incrementing = false;
    public $timestamps = false;
    protected $keyType = 'string';
    
    // ✅ Define fillable fields based on your view structure
    protected $fillable = [
        'lnnumber', 'mreference', 'cs_ck', 'principal', 
        'payments', 'balance', 'debit', 'credit', 'controlno'
    ];
}
