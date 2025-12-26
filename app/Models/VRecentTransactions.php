<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VRecentTransactions extends Model
{
    protected $table = 'vRecentTransactions';

    public $timestamps = false;

    protected $fillable = [
        'acctno',
        'ln_sv_number',
        'date_in',
        'transaction_type',
        'amount',
        'movement',
        'balance',
        'source',
        'principal',
        'deposit',
        'withdrawal',
        'payments',
        'debit',
    ];

    protected $guarded = [];
}
