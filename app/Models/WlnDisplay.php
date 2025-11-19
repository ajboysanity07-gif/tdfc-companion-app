<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnDisplay extends Model
{
    protected $table = 'wln_display';
    protected $fillable = ['typecode', 'isDisplayed'];

    public function type()
    {
        return $this->belongsTo(WlnType::class, 'typecode', 'typecode');
    }
}
