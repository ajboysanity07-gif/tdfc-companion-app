<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Amortsched extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'Amortsched';
    protected $primaryKey = 'controlno';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'controlno',
        'lnnumber',
        'Date_pay',
        'Amortization',
        'Interest',
        'Balance',
    ];

    protected $casts = [
        'Date_pay' => 'datetime',
        'Amortization' => 'float',
        'Interest' => 'float',
        'Balance' => 'float',
    ];
}
