# Changes Diff Summary

## File 1: app/Models/WlnMaster.php

### BEFORE
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WlnMaster extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'wlnmaster';
    protected $primaryKey = 'lnnumber';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];

    public function appUser(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'acctno', 'acctno');
    }
}
```

### AFTER
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WlnMaster extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'wlnmaster';
    protected $primaryKey = 'lnnumber';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];
    protected $appends = ['is_renew_disabled'];  // ← NEW

    public function appUser(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'acctno', 'acctno');
    }

    /**
     * Determine if the Renew button should be disabled.
     * Disabled when:
     * - balance = 0, OR
     * - product typecode != wlnmaster typecode
     */
    public function getIsRenewDisabledAttribute(): bool  // ← NEW
    {
        // Check if balance is zero or null
        if ($this->balance == 0 || $this->balance === null) {
            return true;
        }

        // Check if typecode matches any product tag typecode
        // If the wlnmaster typecode doesn't match any wln_product_tags typecode, disable renewal
        if (!$this->typecode) {
            return true;
        }

        // Query to check if there's a matching typecode in wln_product_tags
        $hasMatchingTag = \Illuminate\Support\Facades\DB::connection('sqlsrv')
            ->table('wln_product_tags')
            ->where('typecode', $this->typecode)
            ->exists();

        return !$hasMatchingTag;
    }
}
```

### Changes Made
- **Line 16**: Added `protected $appends = ['is_renew_disabled'];`
  - This tells Eloquent to include the computed `is_renew_disabled` attribute in JSON serialization
  
- **Lines 24-52**: Added `getIsRenewDisabledAttribute(): bool` method
  - Implements the business logic for determining if renewal should be disabled
  - Checks for zero/null balance
  - Checks if typecode exists in `wln_product_tags` table
  - Returns boolean indicating if Renew button should be disabled

---

## File 2: resources/js/components/client/loans/loan-list.tsx

### BEFORE (Line 409-411)
```tsx
                                    <Tooltip
                                        title={rec.is_renew_disabled ? 'Renewal not available for zero-balance loans with mismatched type code' : ''}
                                        arrow
```

### AFTER (Line 409-411)
```tsx
                                    <Tooltip
                                        title={rec.is_renew_disabled ? 'Renewal not available: type mismatch or zero balance.' : ''}
                                        arrow
```

### Changes Made
- **Line 410**: Updated tooltip message to match requirement specification
  - Old: "Renewal not available for zero-balance loans with mismatched type code"
  - New: "Renewal not available: type mismatch or zero balance."

---

## File 3: app/Http/Controllers/Api/Client/LoansController.php

### Status: NO CHANGES NEEDED ✓

**Why?**
- The controller returns a raw `WlnMaster` collection via `->get()`
- The model's `$appends` property automatically includes `is_renew_disabled` in JSON responses
- Eloquent will call `getIsRenewDisabledAttribute()` for each record and include it in the JSON

**Current Code (lines 14-33):**
```php
public function index(Request $request)
{
    $acctno = $request->user()->acctno ?? null;

    if (!$acctno) {
        return response()->json(['message' => 'Account number (acctno) is required'], 422);
    }

    // Fetch WlnMaster records for this account
    $wlnMasterRecords = WlnMaster::where('acctno', $acctno)
        ->orderBy('lnnumber', 'desc')
        ->get();

    return response()->json([
        'wlnMasterRecords' => $wlnMasterRecords,
    ]);
}
```

This automatically serializes all appended attributes including `is_renew_disabled`.

---

## File 4: resources/js/types/user.ts

### Status: ALREADY CORRECT ✓

**Current Type Definition (already present):**
```typescript
export type WlnMasterRecord = {
    acctno?: string;
    lnnumber?: string;
    balance?: number | string | null;
    date_end?: string | null;
    remarks?: string | null;
    term_mons?: number | string | null;
    amortization?: number | string | null;
    typecode?: string | null;
    is_renew_disabled?: boolean;  // ← Already defined
    [key: string]: unknown;
};
```

No changes needed. The type was already correctly defined to include the `is_renew_disabled` property.

---

## Summary of Changes

| File | Type | Status | Lines Changed |
|------|------|--------|---------------|
| `app/Models/WlnMaster.php` | Backend Model | Modified | +1 property, +29 lines (method) |
| `resources/js/components/client/loans/loan-list.tsx` | Frontend UI | Modified | 1 line (tooltip text) |
| `app/Http/Controllers/Api/Client/LoansController.php` | Backend Controller | No Change | - |
| `resources/js/types/user.ts` | Frontend Types | No Change | - |

**Total Lines Changed: ~31 lines**
**Files Modified: 2**
**Files Unchanged: 2**

---

## Implementation Status

✅ **Complete** - All requirements implemented:
- ✓ Server-side flag computed in WlnMaster model attribute
- ✓ Flag flows through API response automatically
- ✓ UI button disabled when flag is true
- ✓ Tooltip displays appropriate message
- ✓ No test files modified (per requirement)
