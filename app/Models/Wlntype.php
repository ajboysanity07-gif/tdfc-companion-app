<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnType extends Model
{
    protected $table = 'wlntype';
    protected $primaryKey = 'controlno';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $guarded = ['*'];

    public function tagRows()
    {
        return $this->hasMany(WlnProductTags::class, 'typecode', 'typecode');
    }
    public function products()
    {
        return $this->belongsToMany(WlnProducts::class, 'wln_product_tags', 'typecode', 'product_id','typecode','product_id');
    }


}
