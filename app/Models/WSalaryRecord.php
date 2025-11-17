<?php

// app/Models/WSalaryRecord.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class WSalaryRecord extends Model
{
    protected $table = 'wsalary_records';
    protected $fillable = [ 'acctno', 'salary_amount', 'notes'];
}
