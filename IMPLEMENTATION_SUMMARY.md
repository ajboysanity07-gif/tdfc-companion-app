# Renew Button Disable Logic Implementation Summary

## Overview
This implementation adds logic to disable the Renew button on the Loans page (Active Loans list) when either condition is true:
1. `balance = 0` (zero or null balance)
2. `wlnmaster.typecode` does not match any typecode in `wln_product_tags`

The button is enabled only when both conditions are false (balance > 0 AND typecode matches).

## Files Changed

### 1. [app/Models/WlnMaster.php](app/Models/WlnMaster.php)

**Changes:**
- Added `protected $appends = ['is_renew_disabled'];` to automatically include the computed attribute in JSON responses
- Added `getIsRenewDisabledAttribute(): bool` method that computes the disable logic:
  - Returns `true` if `balance == 0 || balance === null`
  - Returns `true` if `typecode` is empty/null
  - Queries `wln_product_tags` table to check if any row has a matching `typecode`
  - Returns `false` only if balance > 0 AND a matching typecode exists in `wln_product_tags`

**Code:**
```php
protected $appends = ['is_renew_disabled'];

public function getIsRenewDisabledAttribute(): bool
{
    // Check if balance is zero or null
    if ($this->balance == 0 || $this->balance === null) {
        return true;
    }

    // Check if typecode matches any product tag typecode
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
```

### 2. [resources/js/components/client/loans/loan-list.tsx](resources/js/components/client/loans/loan-list.tsx)

**Changes:**
- Updated Tooltip title message to match requirement specification:
  - Old: `'Renewal not available for zero-balance loans with mismatched type code'`
  - New: `'Renewal not available: type mismatch or zero balance.'`

**Code:**
```tsx
<Tooltip
    title={rec.is_renew_disabled ? 'Renewal not available: type mismatch or zero balance.' : ''}
    arrow
    placement="top"
    disableHoverListener={!rec.is_renew_disabled}
    enterTouchDelay={0}
    leaveTouchDelay={3000}
>
```

### 3. [app/Http/Controllers/Api/Client/LoansController.php](app/Http/Controllers/Api/Client/LoansController.php)

**Status:** No changes required
- The controller already returns raw `WlnMaster` collection
- The `$appends` property in the model automatically includes `is_renew_disabled` in JSON serialization
- API response will automatically include the field

### 4. [resources/js/types/user.ts](resources/js/types/user.ts)

**Status:** Already defined
- The `WlnMasterRecord` type already includes `is_renew_disabled?: boolean;` property
- This was added in previous work

## Data Flow

```
API Request: GET /loans
    ↓
LoansController.index()
    ↓
WlnMaster::where('acctno', $acctno)->get()
    ↓
Eloquent automatically calls getIsRenewDisabledAttribute() for each record
    ↓
$appends property includes is_renew_disabled in JSON
    ↓
JSON Response includes:
{
    "wlnMasterRecords": [
        {
            "lnnumber": "LN123",
            "balance": 5000,
            "typecode": "01",
            "is_renew_disabled": false,
            ...
        },
        {
            "lnnumber": "LN124",
            "balance": 0,
            "typecode": "02",
            "is_renew_disabled": true,  // disabled due to zero balance
            ...
        }
    ]
}
    ↓
React Component receives data
    ↓
Renew Button uses is_renew_disabled property:
- If true: button is disabled, gray text, tooltip shows on hover
- If false: button is enabled, clickable
```

## Manual Verification Steps

### Prerequisites
1. Ensure Laravel dev server is running: `php artisan serve --host=0.0.0.0 --port=8000`
2. Ensure Vite dev server is running for frontend hot reload

### Test Case 1: Loan with Zero Balance
1. Login as a client
2. Navigate to Loans page
3. If you have a loan with `balance = 0`:
   - The Renew button should be **disabled** (grayed out)
   - Hovering over the button shows: "Renewal not available: type mismatch or zero balance."
   - Clicking the button does nothing

### Test Case 2: Loan with Typecode Mismatch
1. A loan with `balance > 0` but `typecode` not in `wln_product_tags`:
   - The Renew button should be **disabled**
   - Tooltip shows the message
   - Cannot click to renew

### Test Case 3: Loan with Valid Typecode and Positive Balance
1. A loan with `balance > 0` and `typecode` exists in `wln_product_tags`:
   - The Renew button should be **enabled** (full color, clickable)
   - No tooltip shows on hover
   - Can click to open renewal calculator

### Browser Developer Tools Check
1. Open Network tab
2. Navigate to Loans page
3. Check the `/loans` API response:
   ```json
   {
     "wlnMasterRecords": [
       {
         "lnnumber": "...",
         "balance": ...,
         "typecode": "...",
         "is_renew_disabled": true/false,
         ...
       }
     ]
   }
   ```
4. Verify `is_renew_disabled` is included for all records

## Database Queries for Testing

If you need to manually verify the logic:

### Check a specific loan's attributes
```sql
SELECT TOP 1 
    lnnumber, 
    acctno, 
    balance, 
    typecode
FROM wlnmaster
WHERE typecode IS NOT NULL
ORDER BY lnnumber DESC;
```

### Check if a typecode exists in product tags
```sql
SELECT COUNT(*) as tag_count
FROM wln_product_tags
WHERE typecode = '01';  -- Replace with actual typecode
```

### Simulate the computed attribute logic
```sql
SELECT 
    m.lnnumber,
    m.balance,
    m.typecode,
    CASE 
        WHEN ISNULL(m.balance, 0) = 0 THEN 1
        WHEN m.typecode IS NULL THEN 1
        WHEN NOT EXISTS (
            SELECT 1 FROM wln_product_tags t 
            WHERE t.typecode = m.typecode
        ) THEN 1
        ELSE 0
    END as is_renew_disabled
FROM wlnmaster m
WHERE m.acctno = 'ACCOUNT123'
ORDER BY m.lnnumber DESC;
```

## Performance Considerations

The current implementation performs a query for each loan record to check if the typecode exists in `wln_product_tags`. For large loan lists, this could result in N+1 queries.

### Future Optimization
If performance becomes an issue, consider:
1. Eager loading the product tags relationship
2. Using a cached list of valid typecodes
3. Moving the computation to SQL (computed column or view)

For now, the implementation is correct and functional. Most users have a small number of active loans, so N+1 queries should not be a concern.

## API Contract

### Response Structure
```typescript
interface WlnMasterRecord {
    acctno?: string;
    lnnumber?: string;
    balance?: number | string | null;
    date_end?: string | null;
    remarks?: string | null;
    term_mons?: number | string | null;
    amortization?: number | string | null;
    typecode?: string | null;
    is_renew_disabled?: boolean;  // NEW: Always included
    [key: string]: unknown;
}
```

## Testing Notes

- No new tests were added per requirements
- Existing API tests should pass as the new field is additive
- The feature is backward compatible (new field in response)

## Rollback Instructions

If needed to rollback changes:

1. Revert `app/Models/WlnMaster.php` - remove `$appends` and `getIsRenewDisabledAttribute()` method
2. Revert `resources/js/components/client/loans/loan-list.tsx` - update tooltip to previous message
3. The type definition can remain unchanged (optional boolean field)

## Summary

✅ **Implementation Complete**
- Backend: Model attribute computation
- API: Automatically includes field in JSON responses
- Frontend: UI uses field to disable button and show tooltip
- All requirements met without test modifications
