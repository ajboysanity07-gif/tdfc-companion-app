<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnType extends Model
{
    protected $table = 'wlntype';
    protected $fillable = ['typecode', 'lntype', 'int_rate'];

    public function settings()
    {
        return $this->hasOne(WlnSettings::class, 'typecode', 'typecode');
    }
    public function display()
    {
        return $this->hasOne(WlnDisplay::class, 'typecode', 'typecode');
    }
    public function tags()
    {
        return $this->hasMany(WlnTags::class, 'typecode', 'typecode');
    }

}
