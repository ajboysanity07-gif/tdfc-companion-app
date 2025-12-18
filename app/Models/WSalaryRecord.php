<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WSalaryRecord extends Model
{
    use HasFactory;

    // Match the migration table name
    protected $table = 'wsalary_records';
    protected $primaryKey = 'acctno';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'acctno',
        'salary_amount',
    ];

    protected $casts = [
        'salary_amount' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
