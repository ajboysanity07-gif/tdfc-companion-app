<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WSalaryRecord extends Model
{
    use HasFactory;

    protected $table = 'wsalaryrecords';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'acctno',
        'salary_amount',
        'notes',
    ];

    protected $casts = [
        'salary_amount' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
