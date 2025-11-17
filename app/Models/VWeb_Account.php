<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $acctno
 * @property string $lnnumber
 * @property string $lntype
 * @property float|null $balance
 * @property string|null $daterel
 * @property string|null $datemat
 * @property float|null $principal
 * @property int|null $term_days
 */
class VWeb_Account extends Model
{
    /** Use your SQL Server connection */
    protected $connection = 'sqlsrv';

    /** SQL Server view name */
    protected $table = 'VWeb_Account';

    /** Pick a unique key if the view has one (lnnumber is typical) */
    protected $primaryKey = 'lnnumber';

    /** Views are read-only and usually not incrementing/timestamped */
    public $incrementing = false;
    public $timestamps = false;

    /** Guard everything (read-only) */
    protected $guarded = [];
}
