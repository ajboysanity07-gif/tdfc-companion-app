<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VWebAmortsched extends Model
{
    // ✅ Configure model for your amortization view
    protected $table = 'VWeb_Amortsched';
    public $timestamps = false;
    
    // ✅ Updated fillable fields including lnnumber
    protected $fillable = [
        'lnnumber',       // ✅ Added lnnumber column
        'Date_pay', 
        'Principalpay', 
        'Interestm', 
        'Amortization', 
        'Balance', 
        'controlno'       // Keep controlno if still needed
    ];
}
