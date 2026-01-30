# Tailscale Connection Fix for Railway

## Problem
The error logs show:
```
flag provided but not defined: -ephemeral
```

This indicates that an old version of the start-tailscale.sh script is being used that has the `-ephemeral` flag (single dash), which is not supported in Tailscale v1.94.1.

## Root Causes
1. **Old cached Docker image** - Railway is using a cached build with the old script
2. **Wrong flag format** - Older scripts may have used `-ephemeral` instead of `--ephemeral`
3. **Ephemeral flag should not be used** - For persistent connections, don't use ephemeral mode at all

## Solution Steps

### 1. Verify Auth Key Configuration
Make sure your Tailscale auth key is configured correctly in Railway:

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Verify `TAILSCALE_AUTH_KEY` is set to your **reusable, non-ephemeral** key
   - Format should be: `tskey-auth-xxxxx-xxxxxx`
   - Must be marked as **Reusable** and **NOT Ephemeral** in Tailscale Admin Console

### 2. Generate New Auth Key (if needed)
If your auth key is ephemeral or expired:

1. Go to [Tailscale Admin Console](https://login.tailscale.com/admin/settings/keys)
2. Click **Generate auth key**
3. Settings:
   - ✅ **Reusable** (checked)
   - ❌ **Ephemeral** (unchecked)
   - Optional: Set expiration to 90 days or more
   - Optional: Add tags like `tag:railway`
4. Copy the key and update it in Railway

### 3. Force Rebuild on Railway

#### Option A: Using Railway CLI
```bash
railway up --detach
```

#### Option B: Using Railway Dashboard
1. Go to your Railway project
2. Click on your service
3. Click on the **Deployments** tab
4. Click the **⋮** menu on the latest deployment
5. Select **Redeploy**
6. Or push a new commit to trigger rebuild:
   ```bash
   git add .
   git commit -m "fix: update tailscale connection script"
   git push
   ```

### 4. Clear Docker Build Cache (if redeploy doesn't work)
If Railway is still using cached layers:

1. Go to **Settings** → **Service**
2. Scroll down and click **Delete Service**
3. Recreate the service and redeploy

Or use Railway CLI:
```bash
railway service delete
railway up
```

## Verification

After redeployment, check the logs for:

### Success Indicators
```
✓ Connected to Tailscale! IP: 100.x.x.x
✓ SOCKS5 proxy is listening on localhost:1055
✓ Socat tunnel is listening on localhost:1433
```

### If Still Failing
Check logs for errors:
```bash
railway logs
```

Look for:
- ❌ `flag provided but not defined: -ephemeral` → Old script still cached
- ❌ `authentication key invalid` → Auth key expired or wrong
- ❌ `timeout` → Network connectivity issue

## Updated Script
The updated `start-tailscale.sh` now uses:
```bash
tailscale up \
    --authkey="$TAILSCALE_AUTH_KEY" \
    --hostname=railway-laravel \
    --accept-routes \
    --accept-dns=false
```

**Key changes:**
- ✅ No ephemeral flag (uses reusable auth key instead)
- ✅ Proper quoting of `$TAILSCALE_AUTH_KEY`
- ✅ Multi-line format for clarity
- ✅ `--accept-dns=false` to prevent DNS conflicts with Railway

## Testing Locally (Optional)
To test the Docker build locally before deploying:

```bash
# Build the image
docker build -t tdfc-app .

# Run with your Tailscale auth key
docker run -e TAILSCALE_AUTH_KEY="your-key-here" -p 8080:80 tdfc-app

# Check if Tailscale connects
docker logs <container-id>
```

## Common Issues

### Issue 1: Auth Key Expired
**Symptom:** `authentication key invalid`
**Solution:** Generate new auth key in Tailscale Admin Console

### Issue 2: SOCKS5 Not Starting
**Symptom:** `SOCKS5 proxy not responding`
**Solution:** 
- Verify Tailscale is connected first
- Check if port 1055 is available
- Restart the service

### Issue 3: SQL Server Connection Fails
**Symptom:** `socat tunnel not listening on localhost:1433`
**Solution:**
- Verify Tailscale IP of SQL Server is correct (100.100.54.27)
- Check if SQL Server is reachable from Tailscale network
- Verify firewall rules allow Tailscale connections

## Railway Environment Variables Checklist
Ensure these are set in Railway:

- ✅ `TAILSCALE_AUTH_KEY` - Your reusable, non-ephemeral auth key
- ✅ `APP_KEY` - Laravel application key
- ✅ `DB_HOST=127.0.0.1` - Points to socat tunnel
- ✅ `DB_PORT=1433`
- ✅ `DB_DATABASE=your_database`
- ✅ `DB_USERNAME=your_username`
- ✅ `DB_PASSWORD=your_password`
- ✅ `APP_ENV=production`
- ✅ `APP_DEBUG=false`

## Next Steps
1. Update `TAILSCALE_AUTH_KEY` with a reusable key
2. Force rebuild/redeploy on Railway
3. Monitor logs for successful connection
4. Test database connectivity through the app

## Support
If issues persist:
1. Check Railway logs: `railway logs`
2. Check Tailscale status in admin console
3. Verify SQL Server allows Tailscale IP connections
4. Test connectivity from another Tailscale device
