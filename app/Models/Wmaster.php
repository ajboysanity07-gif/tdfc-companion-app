<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Wmaster extends Model
{
    // Connect to your SQL Server connection that points to rbank1
    protected $connection = 'sqlsrv';

    // Just use the table name, not schema prefix
    protected $table = 'wmaster';

    protected $primaryKey = 'acctno';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    public function appUser(): HasOne
    {
        return $this->hasOne(AppUser::class, 'acctno', 'acctno');
    }
}
