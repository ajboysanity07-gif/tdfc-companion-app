<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnTagSummary extends Model
{
    protected $table = 'wln_tag_summary'; // Laravel would guess wln_tag_summaries

    protected $fillable = ['wlntag_id'];
    public function tag()
    {
        return $this->belongsTo(WlnTags::class, 'wlntag_id');
    }
}
