<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as AuthenticatableUser;
use Laravel\Sanctum\HasApiTokens;

class AppUser extends AuthenticatableUser
{
    use HasApiTokens;
    protected $table = 'app_user_table';
    protected $primaryKey = 'user_id';

    // user_id is auto-incrementing integer per migration
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'acctno',
        'phone_no',
        'email',
        'password',
        'profile_picture_path',
        'prc_id_photo_front',
        'prc_id_photo_back',
        'payslip_photo_path',
        'role',
        'status',
        'reviewed_at',
        'reviewed_by',
        'rejected_at',
        'remember_token',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'password' => 'hashed',
        'reviewed_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Boot method for model, automatically eager load wmaster
     */
    protected static function booted()
    {
        static::addGlobalScope('wmaster', function ($query) {
            $query->with('wmaster');
        });
    }

    /**
     * Get the route key name for Laravel routing
     */
    public function getRouteKeyName()
    {
        return 'user_id';
    }

    public function wmaster(): BelongsTo
    {
        return $this->belongsTo(Wmaster::class, 'acctno', 'acctno');
    }

    public function wlnmaster(): HasMany
    {
        return $this->hasMany(WlnMaster::class, 'acctno', 'acctno');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getNameAttribute(): string
    {
        return $this->wmaster?->bname ?? (string) str($this->email)->before('@');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
    public function salaryRecords()
    {
        return $this->hasMany(WSalaryRecord::class, 'acctno', 'acctno');
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Relationship to rejection reasons (many-to-many)
     */
    public function rejectionReasons(): BelongsToMany
    {
        return $this->belongsToMany(
            RejectionReason::class,
            'app_user_rejection_reason',
            'user_id',
            'rejection_reason_id'
        );
    }
}
