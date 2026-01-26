# Railway + ZeroTier Integration Guide

## Overview

This guide provides **step-by-step instructions** to connect your Railway-deployed Laravel app to your local SQL Server using **ZeroTier**, eliminating the need for ngrok and avoiding daily port updates.

## Architecture

```
Your Local Windows Machine          Railway.app Container
┌─────────────────────────┐        ┌──────────────────┐
│ SQL Server (1433)       │        │ Laravel App      │
│ ZeroTier VPN Network    │◀──────▶│ ZeroTier VPN     │
│ IP: 192.168.193.45      │        │ IP: 192.168.193.XX │
│ (Static - never changes)│        │ (Static - never changes) │
└─────────────────────────┘        └──────────────────┘
     (All encrypted)
```

## Prerequisites

- ZeroTier installed and running on your local machine
- ZeroTier Network ID and Network Key
- Local SQL Server with known credentials
- Railway account connected to your GitHub repo
- Docker knowledge (basic)

---

## Part 1: Local Machine Setup

### Step 1: Install ZeroTier Locally

Follow [ZEROTIER_SETUP.md](ZEROTIER_SETUP.md) **Steps 1-3** to:

1. Create ZeroTier account at [zerotier.com](https://zerotier.com)
2. Create a network (e.g., "TDFC-Network")
3. **Note your Network ID** (16-digit hex code)
   - Example: `af342d05d07a88a9`
4. Install ZeroTier on Windows
5. Join your network
6. **Authorize your device** in ZeroTier admin panel
7. **Note your Local Machine's ZeroTier IP**
   - Example: `192.168.193.45`

### Step 2: Verify SQL Server Access

```powershell
# Ensure SQL Server is running
net start MSSQL$SQLEXPRESS

# Verify it's listening on port 1433
netstat -ano | findstr 1433

# Test connection
sqlcmd -S localhost\SQLEXPRESS -U sa -P your_password -Q "SELECT @@version"
```

### Step 3: Configure Windows Firewall

Allow ZeroTier traffic:

```powershell
# Allow ZeroTier
netsh advfirewall firewall add rule name="ZeroTier" dir=in action=allow program="C:\Program Files (x86)\ZeroTier\One\ZeroTier One.exe" enable=yes

# Allow SQL Server on ZeroTier network
netsh advfirewall firewall add rule name="SQL Server ZeroTier" dir=in action=allow protocol=tcp localport=1433 enable=yes
```

### Step 4: Test Local Connection

From another device on your ZeroTier network (or same machine):

```powershell
# Replace with your actual ZeroTier IP
Test-NetConnection -ComputerName 192.168.193.45 -Port 1433

# Output should show: TcpTestSucceeded : True
```

---

## Part 2: Railway Container Setup

### Step 1: Update Your Dockerfile

Modify your project's `Dockerfile` to install ZeroTier:

```dockerfile
# Assuming your base image is something like php:8.2-fpm or similar

FROM php:8.2-fpm

# ... existing setup code ...

# Install ZeroTier
RUN apt-get update && \
    apt-get install -y \
    curl \
    gnupg \
    lsb-release && \
    curl -s https://raw.githubusercontent.com/zerotier/ZeroTierOne/master/doc/linux-install.sh | bash && \
    rm -rf /var/lib/apt/lists/*

# Copy ZeroTier startup script
COPY start-zerotier.sh /usr/local/bin/start-zerotier.sh
RUN chmod +x /usr/local/bin/start-zerotier.sh

# ... rest of your Laravel setup (composer install, etc.) ...

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/start-zerotier.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### Step 2: Create ZeroTier Startup Script

Create a new file `start-zerotier.sh` in your project root:

```bash
#!/bin/bash

set -e

echo "=========================================="
echo "Starting ZeroTier for Railway Container"
echo "=========================================="

# Check required environment variables
if [ -z "$ZEROTIER_NETWORK_ID" ]; then
    echo "ERROR: ZEROTIER_NETWORK_ID environment variable is not set"
    echo "Please set it in Railway dashboard"
    exit 1
fi

# Start ZeroTier daemon
echo "[1/5] Starting ZeroTier daemon..."
if [ ! -d /var/lib/zerotier-one ]; then
    mkdir -p /var/lib/zerotier-one
fi

zerotier-one -d

# Give daemon time to start
sleep 3

# Check if daemon started
if ! pgrep -x "zerotier-one" > /dev/null; then
    echo "ERROR: ZeroTier daemon failed to start"
    exit 1
fi

echo "[2/5] ✓ ZeroTier daemon started"

# Join the network
echo "[3/5] Joining ZeroTier network: $ZEROTIER_NETWORK_ID"
ZEROTIER_CLI_OUTPUT=$(zerotier-cli join "$ZEROTIER_NETWORK_ID" 2>&1) || true
echo "$ZEROTIER_CLI_OUTPUT"

# Wait for network membership and IP assignment
echo "[4/5] Waiting for network membership and IP assignment..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    # Check if we have an IP on the network
    NETWORK_STATUS=$(zerotier-cli listnetworks | grep "$ZEROTIER_NETWORK_ID" || true)
    
    if [ -z "$NETWORK_STATUS" ]; then
        echo "  Attempt $((ATTEMPT+1))/$MAX_ATTEMPTS: Waiting for network join..."
    else
        # Extract IP address (9th column typically)
        ZEROTIER_IP=$(echo "$NETWORK_STATUS" | awk '{print $9}')
        
        # Check if we have a valid IP
        if [ -n "$ZEROTIER_IP" ] && [ "$ZEROTIER_IP" != "-" ]; then
            echo "✓ [4/5] Joined network with IP: $ZEROTIER_IP"
            break
        else
            echo "  Attempt $((ATTEMPT+1))/$MAX_ATTEMPTS: Waiting for IP assignment..."
        fi
    fi
    
    sleep 1
    ATTEMPT=$((ATTEMPT+1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "WARNING: Could not obtain ZeroTier IP within timeout"
    echo "Continuing anyway - network may still be connecting..."
fi

# Show final status
echo "[5/5] ZeroTier Status:"
zerotier-cli status || true
echo ""
echo "Connected Networks:"
zerotier-cli listnetworks || true
echo ""

echo "=========================================="
echo "✓ ZeroTier Ready!"
echo "=========================================="
echo ""
echo "Starting Laravel Application..."
echo ""

# Execute the main command (Laravel artisan serve or whatever)
exec "$@"
```

Make the script executable (if working locally):
```bash
chmod +x start-zerotier.sh
```

### Step 3: Set Railway Environment Variables

Go to your **Railway Dashboard** → **Laravel Service** → **Variables**

Add these variables:

```
ZEROTIER_NETWORK_ID=af342d05d07a88a9
```

Replace `af342d05d07a88a9` with your actual ZeroTier Network ID from [zerotier.com/networks](https://zerotier.com/networks).

### Step 4: Update .env Variables in Railway

In your Railway **Variables** tab, set:

```
DB_CONNECTION=sqlsrv
DB_HOST=192.168.193.45
DB_PORT=1433
DB_DATABASE=your_database_name
DB_USERNAME=sa
DB_PASSWORD=your_sql_server_password
```

**Important:** Replace `192.168.193.45` with your actual **Local Machine ZeroTier IP**.

### Step 5: Verify Dockerfile Configuration

Your complete Dockerfile should look similar to:

```dockerfile
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    git \
    curl \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlsrv sqlsrv

# Install ZeroTier
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -s https://raw.githubusercontent.com/zerotier/ZeroTierOne/master/doc/linux-install.sh | bash && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Copy ZeroTier startup script
COPY start-zerotier.sh /usr/local/bin/start-zerotier.sh
RUN chmod +x /usr/local/bin/start-zerotier.sh

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies (if using Vite/React)
RUN npm install && npm run build

# Set permissions
RUN chown -R www-data:www-data /app

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/start-zerotier.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

---

## Part 3: Deploy to Railway

### Step 1: Commit Changes

```bash
git add .
git commit -m "Add ZeroTier integration for Railway"
```

### Step 2: Push to GitHub

```bash
git push origin main
```

Railway will automatically detect the push and start building.

### Step 3: Monitor Deployment

1. Go to Railway Dashboard
2. Click your **Laravel service**
3. Click **Deployments** tab
4. Watch the build progress
5. Once built, click **View logs**

### Step 4: Check ZeroTier Connection in Logs

Look for lines like:

```
========================================
Starting ZeroTier for Railway Container
==========================================
[1/5] Starting ZeroTier daemon...
[2/5] ✓ ZeroTier daemon started
[3/5] Joining ZeroTier network: af342d05d07a88a9
[4/5] Waiting for network membership and IP assignment...
✓ [4/5] Joined network with IP: 192.168.193.XX
[5/5] ZeroTier Status:
==========================================
✓ ZeroTier Ready!
==========================================

Starting Laravel Application...
```

If you see these messages, ZeroTier connected successfully!

### Step 5: Verify Railway Device in ZeroTier

1. Go to [zerotier.com/admin/networks](https://zerotier.com/admin/networks)
2. Click your network
3. Click **Members** tab
4. You should see a new device (the Railway container)
5. **Authorize it** by checking the checkbox in the **Auth** column
6. Note its **Managed IP**

---

## Part 4: Verify Database Connection

### Method 1: Check Laravel Logs

In Railway logs, look for successful database queries or no connection errors.

### Method 2: Add Health Check Endpoint

Add this to your `routes/api.php`:

```php
Route::get('/health/db', function () {
    try {
        $version = DB::select('SELECT @@version');
        return response()->json([
            'status' => 'connected',
            'database' => 'SQL Server',
            'version' => $version[0] ?? null,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});
```

Then visit: `https://your-railway-app.up.railway.app/api/health/db`

### Method 3: Add ZeroTier Status Endpoint

```php
Route::get('/health/zerotier', function () {
    $status = shell_exec('zerotier-cli status 2>&1');
    $networks = shell_exec('zerotier-cli listnetworks 2>&1');
    
    return response()->json([
        'zerotier_status' => $status,
        'zerotier_networks' => $networks,
        'host' => gethostname(),
    ]);
});
```

---

## Troubleshooting

### Issue: "Connection refused" or "Cannot connect to database"

**Cause:** ZeroTier didn't connect or local machine not authorized

**Solution:**
1. Check [zerotier.com/admin/networks](https://zerotier.com/admin/networks)
2. Find your local machine in Members
3. Verify it's **Authorized** (checkbox ✓)
4. Verify Railway container device is in Members and **Authorized**
5. Check local SQL Server is running:
   ```powershell
   net start MSSQL$SQLEXPRESS
   ```

### Issue: Railway logs show "Cannot start ZeroTier daemon"

**Cause:** Docker container might be missing dependencies

**Solution:**
1. Verify Dockerfile includes all apt-get installs
2. Try reinstalling ZeroTier in Dockerfile:
   ```dockerfile
   RUN curl -s https://raw.githubusercontent.com/zerotier/ZeroTierOne/master/doc/linux-install.sh | bash
   ```

### Issue: "ZEROTIER_NETWORK_ID not set"

**Cause:** Environment variable not configured in Railway

**Solution:**
1. Go to Railway Dashboard → Service → Variables
2. Add: `ZEROTIER_NETWORK_ID=your_network_id_here`
3. Redeploy

### Issue: ZeroTier not showing in Admin Panel

**Cause:** Device joining network but not authorized yet

**Solution:**
1. Wait a few seconds and refresh [zerotier.com/admin/networks](https://zerotier.com/admin/networks)
2. If still not showing, check Railway logs for errors
3. Manually restart container in Railway dashboard

### Issue: SQL Server connection timeout

**Cause:** Firewall blocking ZeroTier traffic

**Solution:**
```powershell
# Allow ZeroTier through Windows Firewall
netsh advfirewall firewall add rule name="ZeroTier" dir=in action=allow program="C:\Program Files (x86)\ZeroTier\One\ZeroTier One.exe" enable=yes

# Allow SQL Server
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=tcp localport=1433 enable=yes
```

---

## Maintenance

### Renew ZeroTier Membership (if needed)

ZeroTier memberships can expire. To prevent issues:

1. Keep your local machine on the network
2. Railway container will auto-reconnect on restart
3. If membership drops, manually re-authorize in admin panel

### Monitor Connection Health

Create a monitoring script in your app:

```php
// app/Console/Commands/CheckZeroTierConnection.php
namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckZeroTierConnection extends Command {
    protected $signature = 'zerotier:check';
    protected $description = 'Check ZeroTier connection status';

    public function handle() {
        $status = shell_exec('zerotier-cli status');
        $networks = shell_exec('zerotier-cli listnetworks');
        
        $this->info("ZeroTier Status:\n$status");
        $this->info("Networks:\n$networks");
    }
}
```

Run: `php artisan zerotier:check`

### Update Railway

When you need to redeploy with new code:

```bash
git add .
git commit -m "Your message"
git push origin main
# Railway auto-redeploys and reconnects to ZeroTier
```

---

## Advantages Over ngrok

| Feature | ZeroTier | ngrok |
|---------|----------|-------|
| **Daily Port Updates** | ❌ No - Static IP | ✅ Yes - Port changes daily |
| **Cost** | 💰 Free | 💰 Free (limited), Paid for stability |
| **Setup Time** | ⏱️ ~15 minutes | ⏱️ ~5 minutes |
| **Speed** | ⚡ Very fast (VPN) | ⚡ Fast (relay) |
| **Reliability** | ✅ Excellent | ✅ Good |
| **Complex Config** | 📝 Medium | 📝 Simple |
| **Scalability** | ✅ Unlimited devices | ⚠️ Limited on free tier |

---

## Summary

✅ **Local Machine:** ZeroTier installed with static IP (e.g., `192.168.193.45`)
✅ **Railway:** Docker container with ZeroTier, connects via static IP
✅ **Database:** Accessible from Railway without ngrok
✅ **No Daily Updates:** IP never changes
✅ **Secure:** Encrypted VPN connection
✅ **Reliable:** Persistent connection

**Your Rails app is now securely connected to your local SQL Server via ZeroTier!**

