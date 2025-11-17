<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnActive extends Model
{
    protected $fillable = ['typecode'];
    public function type()
    {
        return $this->belongsTo(WlnType::class, 'typecode', 'typecode');
    }
}
