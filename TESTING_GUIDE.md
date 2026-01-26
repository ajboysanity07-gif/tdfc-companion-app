# Manual Testing Guide for Renew Button Disable Logic

## Quick Start

### Prerequisites
- Laravel app running on http://localhost:8000
- Frontend dev server (Vite) running
- Logged in as a client user

### Step 1: Check API Response

Open browser DevTools (F12):
1. Go to Network tab
2. Navigate to `/client/{acctno}/loans` or wait for Loans page to load
3. Find the `/loans` API call
4. Click on it and check the Response

**Expected Response Format:**
```json
{
  "wlnMasterRecords": [
    {
      "lnnumber": "LN001",
      "acctno": "ACC123",
      "balance": 50000,
      "typecode": "01",
      "is_renew_disabled": false,
      "remarks": "HOME LOAN",
      "date_end": "2026-12-31",
      ...
    },
    {
      "lnnumber": "LN002",
      "acctno": "ACC123",
      "balance": 0,
      "typecode": "02",
      "is_renew_disabled": true,
      ...
    }
  ]
}
```

### Step 2: Verify Frontend Rendering

1. On the Loans page, look at each loan card
2. For each loan:
   - If `is_renew_disabled` is `false`:
     - Renew button is **RED** and clickable
     - No tooltip on hover
   - If `is_renew_disabled` is `true`:
     - Renew button is **GRAY** and disabled
     - Hovering shows tooltip: "Renewal not available: type mismatch or zero balance."
     - Clicking does nothing

### Step 3: Test Each Scenario

#### Scenario A: Loan with Balance = 0
- Check a loan record with balance 0
- `is_renew_disabled` should be `true`
- Button should be disabled

#### Scenario B: Loan with Invalid Typecode
To test this, you need a loan where the typecode doesn't exist in `wln_product_tags`:
```sql
SELECT DISTINCT typecode FROM wln_product_tags;
```
Find a `typecode` value in `wlnmaster` that does NOT appear in the query above.

- The loan should show `is_renew_disabled: true`
- Button should be disabled

#### Scenario C: Loan with Valid Typecode and Balance > 0
- Find a loan with balance > 0 and a typecode that exists in `wln_product_tags`
- `is_renew_disabled` should be `false`
- Button should be enabled (clickable)

## Database Verification

If you need to manually verify the logic:

### Option 1: Direct SQL Query (Simulating the Computed Attribute)

```sql
-- Replace 'ACC123' with actual account number
SELECT 
    m.lnnumber,
    m.balance,
    m.typecode,
    CASE 
        WHEN ISNULL(m.balance, 0) = 0 THEN 1  -- Zero balance
        WHEN m.typecode IS NULL THEN 1         -- No typecode
        WHEN NOT EXISTS (
            SELECT 1 FROM wln_product_tags t 
            WHERE t.typecode = m.typecode
        ) THEN 1                               -- Typecode not in product tags
        ELSE 0                                 -- Valid for renewal
    END AS is_renew_disabled
FROM wlnmaster m
WHERE m.acctno = 'ACC123'
ORDER BY m.lnnumber DESC;
```

### Option 2: Laravel Tinker Test

```bash
php artisan tinker
```

Then in the tinker shell:

```php
# Get the authenticated user's loans
>>> $loans = App\Models\WlnMaster::where('acctno', 'ACC123')->get();

# Check the computed attribute for each loan
>>> $loans->each(function($loan) {
  echo "Loan: {$loan->lnnumber}, Balance: {$loan->balance}, Typecode: {$loan->typecode}, Disabled: " . ($loan->is_renew_disabled ? 'true' : 'false') . "\n";
});
```

Output example:
```
Loan: LN001, Balance: 50000, Typecode: 01, Disabled: false
Loan: LN002, Balance: 0, Typecode: 02, Disabled: true
Loan: LN003, Balance: 25000, Typecode: 99, Disabled: true
```

### Option 3: Direct API Call with cURL/Postman

```bash
# Get the token first (after login)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use the token to call loans API
curl -X GET http://localhost:8000/api/loans \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Behavior Matrix

| Balance | Typecode in Tags | is_renew_disabled | Button State | Tooltip |
|---------|------------------|------------------|--------------|---------|
| > 0     | Yes              | false            | Enabled      | None    |
| > 0     | No               | true             | Disabled     | Show    |
| 0       | Yes              | true             | Disabled     | Show    |
| 0       | No               | true             | Disabled     | Show    |
| NULL    | Yes              | true             | Disabled     | Show    |
| NULL    | No               | true             | Disabled     | Show    |

## Debugging Tips

### Check if TypeCodes Exist
```sql
SELECT DISTINCT typecode FROM wln_product_tags ORDER BY typecode;
```

### Check Loans with Missing TypeCodes
```sql
SELECT lnnumber, typecode FROM wlnmaster
WHERE typecode NOT IN (SELECT DISTINCT typecode FROM wln_product_tags)
   OR typecode IS NULL
ORDER BY lnnumber;
```

### Check Loans with Zero Balance
```sql
SELECT lnnumber, balance FROM wlnmaster
WHERE balance = 0 OR balance IS NULL
ORDER BY lnnumber;
```

### Monitor API Calls
1. Open DevTools Network tab
2. Filter by `/loans`
3. Check request/response for each API call
4. Verify `is_renew_disabled` is included in response

### Check Browser Console
Look for any errors in the Browser Console (F12 -> Console tab):
- If the field is not recognized, TypeScript errors will show
- Check if the component is receiving the prop correctly

## Troubleshooting

### Issue: `is_renew_disabled` not in API response

**Cause:** The model's `$appends` property may not be recognized

**Solution:**
1. Verify `WlnMaster.php` has `protected $appends = ['is_renew_disabled'];`
2. Check that method name is `getIsRenewDisabledAttribute()`
3. Restart Laravel: `php artisan serve`
4. Clear config cache: `php artisan config:clear`

### Issue: Button not disabling even when `is_renew_disabled` is true

**Cause:** Component may not be re-rendering

**Solution:**
1. Check React DevTools (React plugin for Chrome)
2. Verify the prop is being passed correctly
3. Check for prop drilling issues in the component
4. Clear browser cache: Ctrl+Shift+Delete -> Clear All

### Issue: Tooltip not showing

**Cause:** `disableHoverListener` might be preventing it

**Solution:**
1. Check if `is_renew_disabled` is actually true
2. Verify tooltip placement: `placement="top"`
3. Check MUI version compatibility
4. Try clicking (tooltip might only show on click for mobile)

## Performance Check

### Monitor Database Queries

```bash
# In Laravel
php artisan tinker
>>> DB::enableQueryLog();
>>> $loans = App\Models\WlnMaster::where('acctno', 'ACC123')->get();
>>> $loans->each(fn($l) => $l->is_renew_disabled);
>>> foreach(DB::getQueryLog() as $query) { echo $query['query'] . "\n"; }
```

This will show:
1. Initial SELECT from wlnmaster (1 query)
2. N queries to check wln_product_tags (one per loan - N+1 pattern)

**Note:** This is expected for small number of loans (typically < 10). If you have many loans, consider optimization.

## Success Criteria

✅ **Implementation is successful when:**
1. API returns `is_renew_disabled` property for all loans
2. Button is disabled when `is_renew_disabled` is true
3. Button is enabled when `is_renew_disabled` is false
4. Tooltip shows when button is disabled
5. Tooltip message is: "Renewal not available: type mismatch or zero balance."
6. No JavaScript errors in console
7. Database queries are reasonable (< 100ms for typical user with 10 loans)
