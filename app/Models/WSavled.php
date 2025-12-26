<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WSavled extends Model
{
    protected $table = 'wsavled';

    protected $primaryKey = 'controlno';

    protected $fillable = [
        'svstatus',
        'acctno',
        'svnumber',
        'bname',
        'typecode',
        'svtype',
        'date_in',
        'mreference',
        'cs_ck',
        'clearing',
        'deposit',
        'withdrawal',
        'balance',
        'transno',
        'controlno',
        'initial',
    ];
}
