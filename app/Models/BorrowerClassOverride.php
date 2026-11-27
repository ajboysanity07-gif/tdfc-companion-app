<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowerClassOverride extends Model
{
    protected $fillable = [
        'user_id',
        'previous_override_class',
        'new_override_class',
        'detected_class',
        'reason',
        'changed_by',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'user_id', 'user_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'changed_by', 'user_id');
    }
}
