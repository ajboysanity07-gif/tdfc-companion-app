<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as AuthenticatableUser;
use Illuminate\Notifications\Notifiable;

class AppUser extends AuthenticatableUser
{
    use Notifiable;

    protected $table = 'app_user_table';

    protected $primaryKey = 'user_id';

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
        'manual_borrower_class',
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

    /** Whose data a shared member page shows: the {user} of an admin route (approved clients only), else the logged-in user. */
    public static function subject(\Illuminate\Http\Request $request): ?self
    {
        $member = $request->route('user');
        if ($member === null) {
            return $request->user();
        }
        // Routes don't type-hint AppUser, so {user:user_id} arrives as a raw string.
        $member = $member instanceof self ? $member : static::where('user_id', $member)->firstOrFail();
        abort_unless($member->role === 'client' && $member->isApproved(), 404);

        return $member;
    }

    /** Extra Inertia props when an admin views a member's page; empty for the member's own pages. */
    public static function adminViewProps(\Illuminate\Http\Request $request): array
    {
        $member = $request->route('user') !== null ? static::subject($request) : null;

        return $member
            ? ['base' => '/admin/clients/'.$member->user_id, 'member' => ['name' => $member->name, 'acctno' => $member->acctno, 'class' => \App\Services\BorrowerClass::effectiveFor($member)]]
            : [];
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

    public function borrowerClassOverrides(): HasMany
    {
        return $this->hasMany(BorrowerClassOverride::class, 'user_id', 'user_id');
    }
}
