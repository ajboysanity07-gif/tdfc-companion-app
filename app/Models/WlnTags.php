<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnTags extends Model
{
    protected $fillable = ['typecode', 'tag_name'];
    public function summaries()
    {
        return $this->hasMany(WlnTagSummary::class, 'wlntag_id');
    }
    public function type()
    {
        return $this->belongsTo(WlnType::class, 'typecode', 'typecode');
    }
}
