<?php

// app/Models/RejectionReason.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RejectionReason extends Model
{
    protected $table = 'rejection_reasons';
    protected $fillable = ['code', 'label'];

    public function users()
    {
        return $this->belongsToMany(
            AppUser::class,
            'app_user_rejection_reason',
            'rejection_reason_id',
            'user_id'
        );
    }
}
