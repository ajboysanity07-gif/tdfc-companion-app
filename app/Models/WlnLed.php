<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnLed extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'wlnled';
    protected $primaryKey = 'controlno';
    public $timestamps = false;
    protected $guarded = [];

    protected $casts = [
        'date_in' => 'datetime',
        'principal' => 'float',
        'payments' => 'float',
        'debit' => 'float',
        'credit' => 'float',
        'balance' => 'float',
        'accruedint' => 'float',
    ];
}
