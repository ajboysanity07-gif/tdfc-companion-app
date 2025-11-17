<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnTagSummary extends Model
{
    protected $fillable = ['wlntag_id'];
    public function tag()
    {
        return $this->belongsTo(WlnTags::class, 'wlntag_id');
    }
}
