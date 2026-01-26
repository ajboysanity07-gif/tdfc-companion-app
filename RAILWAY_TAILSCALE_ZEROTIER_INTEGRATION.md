# Tailscale/ZeroTier Integration with Railway

## Overview

This guide explains how to connect your Railway-deployed Laravel app to your local SQL Server using Tailscale or ZeroTier instead of ngrok. This eliminates the need to update TCP ports daily.

### Architecture

```
Your Local Windows Machine          Railway.app
┌─────────────────────────┐        ┌──────────────────┐
│ SQL Server (1433)       │        │ Laravel App      │
│ Tailscale/ZeroTier      │◀──────▶│ Tailscale/ZeroTier│
│ IP: 100.x.x.x (static) │        │ (Container)      │
└─────────────────────────┘        └──────────────────┘
     (NO ngrok needed!)
```

## Why This Approach?

✅ **No ngrok TCP port changes** - Tailscale/ZeroTier IPs are permanent
✅ **Secure** - Encrypted VPN tunnel
✅ **Fast** - Direct network connection vs. ngrok relay
✅ **Free** - No paid services needed
✅ **Reliable** - Persistent connection

---

## Option 1: Tailscale Integration (Recommended)

### Step 1: Set Up Tailscale on Your Local Machine

Follow [TAILSCALE_SETUP.md](TAILSCALE_SETUP.md) steps 1-3 to:
1. Create a Tailscale account
2. Install Tailscale locally
3. Get your **Local Machine Tailscale IP** (e.g., `100.120.45.67`)

**Keep this IP handy** - you'll need it for Railway.

### Step 2: Create Tailscale Auth Key for Railway

Authentication keys allow headless (non-interactive) login for Railway container.

1. Go to [tailscale.com/admin/settings/keys](https://tailscale.com/admin/settings/keys)
2. Click **Generate auth key**
3. Set options:
   - **Ephemeral:** Leave unchecked (so device stays connected)
   - **Reusable:** Check (allows Railway to reconnect if needed)
   - **Expiration:** 90 days or custom
   - **Tags:** Add `tag:railway` (optional, for organization)
4. Click **Generate key**
5. **Copy the key** (it won't be shown again)
   - Format: `tskey-auth-XXXXXXXXXXXXXXXXXXXXX`

### Step 3: Add Tailscale Auth Key to Railway

In your Railway project dashboard:

1. Go to your **Laravel service**
2. Go to **Variables** tab
3. Add new variable:
   ```
   TAILSCALE_AUTH_KEY=tskey-auth-XXXXXXXXXXXXXXXXXXXXX
   ```
4. Save changes

### Step 4: Update Railway Dockerfile

Modify your `Dockerfile` to install and run Tailscale:

```dockerfile
# Add this section after your base image setup, before dependencies

# Install Tailscale
RUN apt-get update && apt-get install -y tailscale && rm -rf /var/lib/apt/lists/*

# Copy Tailscale startup script
COPY start-tailscale.sh /usr/local/bin/start-tailscale.sh
RUN chmod +x /usr/local/bin/start-tailscale.sh

# Existing Laravel setup continues...
# RUN composer install
# etc.
```

### Step 5: Create Start Script

Create `start-tailscale.sh` in your project root:

```bash
#!/bin/bash

# Start Tailscale in background
echo "Starting Tailscale..."
tailscaled &

# Wait for tailscaled to be ready
sleep 2

# Connect using auth key
if [ -z "$TAILSCALE_AUTH_KEY" ]; then
    echo "ERROR: TAILSCALE_AUTH_KEY not set"
    exit 1
fi

tailscale up --authkey=$TAILSCALE_AUTH_KEY --hostname=railway-laravel

# Wait for Tailscale to connect
echo "Waiting for Tailscale to connect..."
for i in {1..30}; do
    if tailscale status | grep -q "100\."; then
        TAILSCALE_IP=$(tailscale ip -4)
        echo "✓ Connected to Tailscale! IP: $TAILSCALE_IP"
        break
    fi
    sleep 1
done

# Now start your Laravel app
exec "$@"
```

### Step 6: Update Dockerfile to Use Script

```dockerfile
# Before your CMD or ENTRYPOINT

ENTRYPOINT ["/usr/local/bin/start-tailscale.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### Step 7: Update Railway Config

Add to your `railway.toml` (or set via Railway UI):

```toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "/usr/local/bin/start-tailscale.sh && php artisan serve --host=0.0.0.0 --port=8000"
```

### Step 8: Update Your .env

Update Railway environment variables:

```env
DB_CONNECTION=sqlsrv
DB_HOST=100.120.45.67
DB_PORT=1433
DB_DATABASE=your_database
DB_USERNAME=sa
DB_PASSWORD=your_password
```

Replace `100.120.45.67` with your actual **Local Machine Tailscale IP**.

### Step 9: Deploy to Railway

```bash
# Push to GitHub
git add .
git commit -m "Add Tailscale integration"
git push

# Railway will auto-deploy when connected to GitHub
# Or manually trigger deployment in Railway dashboard
```

### Step 10: Verify Connection

1. Go to Railway dashboard
2. Open your **Laravel service** logs
3. Look for: `✓ Connected to Tailscale! IP: 100.x.x.x`
4. Check that app starts without database connection errors

Test from your local machine:
```powershell
# Check if Railway is on your Tailscale network
ping <railway-tailscale-ip>

# Or check Railway admin panel at https://tailscale.com/admin/machines
# You should see "railway-laravel" listed as Online
```

---

## Option 2: ZeroTier Integration

### Step 1: Set Up ZeroTier on Your Local Machine

Follow [ZEROTIER_SETUP.md](ZEROTIER_SETUP.md) steps 1-3 to:
1. Create a ZeroTier account
2. Install ZeroTier locally
3. Get your **Local Machine ZeroTier IP** (e.g., `192.168.193.45`)
4. Get your **Network ID** (16-digit hex)

### Step 2: Add ZeroTier to Railway

Update `Dockerfile`:

```dockerfile
# Install ZeroTier
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -s https://raw.githubusercontent.com/zerotier/ZeroTierOne/master/doc/linux-install.sh | bash && \
    rm -rf /var/lib/apt/lists/*

# Copy ZeroTier startup script
COPY start-zerotier.sh /usr/local/bin/start-zerotier.sh
RUN chmod +x /usr/local/bin/start-zerotier.sh
```

### Step 3: Create ZeroTier Start Script

Create `start-zerotier.sh`:

```bash
#!/bin/bash

# Start ZeroTier service
echo "Starting ZeroTier..."
zerotier-one -d

# Wait for ZeroTier to start
sleep 3

# Join network
if [ -z "$ZEROTIER_NETWORK_ID" ]; then
    echo "ERROR: ZEROTIER_NETWORK_ID not set"
    exit 1
fi

echo "Joining ZeroTier network: $ZEROTIER_NETWORK_ID"
zerotier-cli join $ZEROTIER_NETWORK_ID

# Wait for network to be joined
echo "Waiting for network membership..."
for i in {1..30}; do
    MEMBER_STATUS=$(zerotier-cli listnetworks | grep "$ZEROTIER_NETWORK_ID")
    if echo "$MEMBER_STATUS" | grep -q "PRIVATE"; then
        echo "✓ Joined ZeroTier network!"
        ZEROTIER_IP=$(zerotier-cli listnetworks | grep "$ZEROTIER_NETWORK_ID" | awk '{print $9}')
        echo "✓ ZeroTier IP: $ZEROTIER_IP"
        break
    fi
    sleep 1
done

# Start Laravel app
exec "$@"
```

### Step 4: Update .env with ZeroTier IP

```env
DB_CONNECTION=sqlsrv
DB_HOST=192.168.193.45
DB_PORT=1433
DB_DATABASE=your_database
DB_USERNAME=sa
DB_PASSWORD=your_password
```

### Step 5: Add ZeroTier Network ID to Railway

In Railway dashboard → **Variables**:

```
ZEROTIER_NETWORK_ID=af342d05d07a88a9
```

### Step 6: Deploy

```bash
git add .
git commit -m "Add ZeroTier integration"
git push
```

---

## Comparing Tailscale vs ZeroTier on Railway

| Aspect | Tailscale | ZeroTier |
|--------|-----------|----------|
| Setup complexity | Simpler | Slightly complex |
| Container image size | Smaller | Slightly larger |
| Auth method | Auth keys (built-in) | Manual network join |
| IP stability | Very stable | Very stable |
| Performance | Excellent | Excellent |
| Recommended | ✅ YES | ✅ Also good |

**Recommendation:** Use **Tailscale** - it's designed for headless/container deployment.

---

## Troubleshooting Railway Integration

### Railway Logs Show Connection Refused

1. **Check local SQL Server is running:**
   ```powershell
   net start MSSQL$SQLEXPRESS
   ```

2. **Verify Tailscale/ZeroTier IP is correct in .env**

3. **Check Windows Firewall allows SQL Server:**
   ```powershell
   netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=tcp localport=1433 enable=yes
   ```

4. **Check device is authorized:**
   - Go to [tailscale.com/admin/machines](https://tailscale.com/admin/machines)
   - Find `railway-laravel` machine
   - Verify it's showing as **Online**

### Tailscale/ZeroTier Not Connecting

1. **Check logs in Railway:**
   - Look for `✓ Connected to Tailscale!` message
   - If missing, Tailscale failed to start

2. **Verify auth key is correct:**
   - Re-check variable in Railway dashboard
   - Make sure it's the full key: `tskey-auth-...`

3. **Check script permissions:**
   ```dockerfile
   RUN chmod +x /usr/local/bin/start-tailscale.sh
   ```

### Slow Database Queries

- Tailscale/ZeroTier are fast, but first connection may take 1-2 seconds
- Check your SQL Server query performance
- Verify database indexes are properly configured

### Device Keeps Disconnecting

1. **Tailscale:**
   - Set auth key to **Reusable**: ✓
   - Set auth key to **NOT Ephemeral**: ✓

2. **ZeroTier:**
   - Add network route if needed in ZeroTier admin panel

---

## Migration from ngrok to Tailscale/ZeroTier

### Step 1: Stop ngrok
```bash
# Kill ngrok process
taskkill /IM ngrok.exe /F
```

### Step 2: Remove ngrok from .env
```env
# REMOVE:
# DB_HOST=0.tcp.ngrok.io
# DB_PORT=12345

# ADD:
DB_HOST=100.120.45.67  # or your Tailscale IP
DB_PORT=1433
```

### Step 3: Deploy Railway with Tailscale/ZeroTier

Follow steps above for your chosen solution.

### Step 4: Verify New Connection Works

Test from Railway logs and local machine.

### Step 5: Remove ngrok

- Delete ngrok installation
- Update any documentation
- No more daily port updates needed!

---

## Monitoring & Maintenance

### Check Tailscale Status in Railway

Add a route in your Laravel app to check connection:

```php
// routes/api.php
Route::get('/health/tailscale', function () {
    $shell = shell_exec('which tailscale 2>&1');
    $installed = $shell !== null;
    
    $status = null;
    if ($installed) {
        $status = shell_exec('tailscale status 2>&1');
    }
    
    return response()->json([
        'tailscale_installed' => $installed,
        'status' => $status,
        'db_connection' => DB::connection()->getDatabaseName(),
    ]);
});
```

Visit: `https://your-railway-app.up.railway.app/api/health/tailscale`

### Renew Auth Keys

Tailscale auth keys expire by default. Before expiration:

1. Go to [tailscale.com/admin/settings/keys](https://tailscale.com/admin/settings/keys)
2. Generate new key
3. Update Railway variable: `TAILSCALE_AUTH_KEY`
4. Redeploy

---

## Summary

✅ **Local Machine:** Tailscale/ZeroTier installed with static IP
✅ **Railway Container:** Tailscale/ZeroTier installed via Docker
✅ **Connection:** Docker → Tailscale/ZeroTier → Local SQL Server
✅ **No ngrok:** Clean, fast, reliable setup
✅ **Permanent IPs:** No daily updates needed

**Your Laravel app on Railway now connects to your local SQL Server without ngrok!**

