# Railway Deployment Guide (Hybrid Setup)
## Laravel + React on Railway + Local SQL Server

This guide shows how to deploy your Laravel + React app to Railway (free) while keeping your SQL Server database running locally.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Desktop App    │────▶│  SQL Server      │◀────│ Cloudflare      │
│  (Local)        │     │  (Local Machine) │     │ Tunnel          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               ▲                           ▲
                               │                           │
                               └───────────────────────────┘
                                                           │
                                                           │
                                                  ┌─────────────────┐
                                                  │  Laravel App    │
                                                  │  (Railway.app)  │
                                                  └─────────────────┘
                                                           ▲
                                                           │
                                                  ┌─────────────────┐
                                                  │  Users          │
                                                  │  (Internet)     │
                                                  └─────────────────┘
```

---

## Prerequisites

- [x] GitHub account (free)
- [x] SQL Server running locally (SSMS)
- [x] Your TDFCapp Laravel project
- [x] Node.js installed locally

---

## Part 1: Setup Cloudflare Tunnel (Expose Local SQL Server)

### Step 1.1: Install Cloudflare Tunnel (cloudflared)

**Windows:**
```powershell
# Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# Create directory and move to permanent location
New-Item -Path "C:\cloudflared" -ItemType Directory -Force
Move-Item -Path ".\cloudflared.exe" -Destination "C:\cloudflared\cloudflared.exe" -Force

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($currentPath -notlike "*C:\cloudflared*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;C:\cloudflared", [EnvironmentVariableTarget]::User)
}

# Refresh PATH in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")

# Verify installation
cloudflared --version
```

### Step 1.2: Authenticate Cloudflare

```powershell
cloudflared tunnel login
```
- Browser will open
- Login to Cloudflare (create free account if needed)
- Select a domain (or use cloudflare temporary domain)

### Step 1.3: Create Tunnel

```powershell
# Create tunnel named "tdfc-companion-app"
cloudflared tunnel create tdfc-companion-app

# Note the Tunnel ID shown (looks like: 12345678-1234-1234-1234-123456789abc)
```

### Step 1.4: Configure SQL Server to Accept Remote Connections

**Enable TCP/IP:**
1. Open **SQL Server Configuration Manager**
2. Go to **SQL Server Network Configuration** → **Protocols for MSSQLSERVER**
3. Right-click **TCP/IP** → **Enable**
4. Right-click **TCP/IP** → **Properties** → **IP Addresses** tab
5. Scroll to **IPALL** → Set **TCP Port: 1433**
6. Click **OK** and restart SQL Server service

**Enable SQL Server Authentication:**
1. Open **SSMS**
2. Right-click server → **Properties** → **Security**
3. Select **SQL Server and Windows Authentication mode**
4. Click **OK** and restart SQL Server service

**Create SQL Login for Laravel:**
```sql
-- In SSMS, run this:
CREATE LOGIN laravel_user WITH PASSWORD = 'YourStrongPassword123!';
GO

USE your_database_name;
GO

CREATE USER laravel_user FOR LOGIN laravel_user;
GO

ALTER ROLE db_datareader ADD MEMBER laravel_user;
ALTER ROLE db_datawriter ADD MEMBER laravel_user;
GO
```

### Step 1.5: Create Tunnel Config File

```powershell
# Create config directory
New-Item -Path "$env:USERPROFILE\.cloudflared" -ItemType Directory -Force

# Create config file
@"
tunnel: tdfc-companion-app
credentials-file: $env:USERPROFILE\.cloudflared\12345678-1234-1234-1234-123456789abc.json

ingress:
  - hostname: sql.yourdomain.com
    service: tcp://localhost:1433
  - service: http_status:404
"@ | Out-File -FilePath "$env:USERPROFILE\.cloudflared\config.yml" -Encoding UTF8
```

**Replace:**
- `12345678-1234-1234-1234-123456789abc.json` with your actual tunnel credentials file (keep tdfc-companion-app as is)
- `12345678-1234-1234-1234-123456789abc.json` with your actual tunnel credentials file
- `sql.yourdomain.com` with your desired hostname (or use the auto-generated one)

### Step 1.6: Route DNS (if using custom domain)

```powershell
cloudflared tunnel route dns tdfc-companion-app sql.yourdomain.com
```

### Step 1.7: Run Tunnel

```powershell
# Test run (keep this window open)
cloudflared tunnel run tdfc-companion-app
```

**To run as Windows Service (auto-start):**
```powershell
cloudflared service install
```

**Your SQL Server is now accessible at:** `sql.yourdomain.com:1433`

---

## Part 2: Prepare Laravel App for Deployment

### Step 2.1: Update Database Configuration

Edit `config/database.php`:

```php
'sqlsrv' => [
    'driver' => 'sqlsrv',
    'url' => env('DB_URL'),
    'host' => env('DB_HOST', 'localhost'),
    'port' => env('DB_PORT', '1433'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8',
    'prefix' => '',
    'prefix_indexes' => true,
    // Add trust server certificate for tunnel connection
    'trust_server_certificate' => true,
],
```

### Step 2.2: Create Production .env Template

Create `.env.railway` (template for Railway):

```env
APP_NAME="TDFC App"
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=https://your-app-name.up.railway.app

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=sqlsrv
DB_HOST=sql.yourdomain.com
DB_PORT=1433
DB_DATABASE=your_database_name
DB_USERNAME=laravel_user
DB_PASSWORD=YourStrongPassword123!

# Add trust for Cloudflare tunnel
DB_TRUST_SERVER_CERTIFICATE=true

SESSION_DRIVER=file
SESSION_LIFETIME=120

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
```

### Step 2.3: Create Railway-specific Files

**Create `railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "composer install --optimize-autoloader --no-dev && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan serve --host=0.0.0.0 --port=$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Create `nixpacks.toml`:**
```toml
[phases.setup]
nixPkgs = ["php82", "php82Extensions.pdo", "php82Extensions.pdo_sqlsrv", "php82Extensions.sqlsrv", "nodejs", "unixODBC"]

[phases.install]
cmds = [
    "composer install --optimize-autoloader --no-dev",
    "npm install",
    "npm run build"
]

[phases.build]
cmds = [
    "php artisan config:cache",
    "php artisan route:cache",
    "php artisan view:cache"
]

[start]
cmd = "php artisan serve --host=0.0.0.0 --port=$PORT"
```

### Step 2.4: Update .gitignore

Make sure these are NOT ignored (Railway needs them):
```gitignore
# Keep these files for Railway
!public/build
!composer.lock
!package-lock.json
```

### Step 2.5: Build Production Assets

```powershell
# Build for production
npm run build
```

### Step 2.6: Push to GitHub

```powershell
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Railway deployment"

# Create GitHub repo (go to github.com/new)
# Then push
git remote add origin https://github.com/yourusername/TDFCapp.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy to Railway

### Step 3.1: Sign Up to Railway

1. Go to https://railway.app
2. Click **"Login with GitHub"**
3. Authorize Railway
4. **No credit card required!**

### Step 3.2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **TDFCapp** repository
4. Railway will auto-detect Laravel

### Step 3.3: Configure Environment Variables

1. Click on your deployment
2. Go to **"Variables"** tab
3. Click **"RAW Editor"**
4. Paste your `.env.railway` content
5. Click **"Update Variables"**

**Important variables:**
```env
APP_KEY=base64:... (generate with: php artisan key:generate --show)
DB_HOST=sql.yourdomain.com
DB_PORT=1433
DB_DATABASE=your_database_name
DB_USERNAME=laravel_user
DB_PASSWORD=YourStrongPassword123!
```

### Step 3.4: Add Custom Domain (Optional)

1. Go to **"Settings"** tab
2. Click **"Generate Domain"** (Railway provides free subdomain)
3. Or add your custom domain

### Step 3.5: Deploy

Railway will automatically deploy. Wait 3-5 minutes.

**Check logs:**
- Click **"Deployments"** tab
- View build and deploy logs

---

## Part 4: Test the Deployment

### Step 4.1: Test SQL Server Connection

```powershell
# From Railway deployment logs, check for:
# "Database connection successful"
```

### Step 4.2: Test Application

1. Visit your Railway URL: `https://your-app.up.railway.app`
2. Try logging in
3. Check if data loads from your local SQL Server

### Step 4.3: Monitor Cloudflare Tunnel

```powershell
# Check tunnel status
cloudflared tunnel info tdfc-companion-app

# View tunnel logs
cloudflared tunnel logs tdfc-companion-app
```

---

## Part 5: Maintenance & Updates

### Update Application

```powershell
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Railway will auto-deploy!
```

### Keep Tunnel Running

**Option 1: Run as Windows Service (Recommended)**
```powershell
# Install service
cloudflared service install

# Start service
Start-Service cloudflared

# Check status
Get-Service cloudflared
```

**Option 2: Run in Background**
```powershell
# Create a scheduled task to run on startup
# Or keep PowerShell window open with tunnel running
```

---

## Troubleshooting

### Issue: Railway can't connect to SQL Server

**Solution:**
1. Check Cloudflare tunnel is running: `cloudflared tunnel info tdfc-companion-app`
2. Test connection from Railway logs
3. Verify SQL Server firewall allows port 1433
4. Check SQL Server is running and TCP/IP enabled

### Issue: "Login failed for user"

**Solution:**
```sql
-- In SSMS, verify user permissions:
USE your_database_name;
GO

SELECT dp.name, dp.type_desc, o.name AS object_name, p.permission_name
FROM sys.database_permissions p
JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id
LEFT JOIN sys.objects o ON p.major_id = o.object_id
WHERE dp.name = 'laravel_user';
```

### Issue: Build fails on Railway

**Solution:**
1. Check `railway.json` and `nixpacks.toml` are in root
2. Verify `composer.json` has all dependencies
3. Check Railway build logs for specific error

### Issue: Assets not loading

**Solution:**
```php
// In config/app.php, ensure:
'asset_url' => env('ASSET_URL'),

// In .env on Railway:
ASSET_URL=https://your-app.up.railway.app
```

---

## Security Notes

### Secure Your Tunnel

1. **Use strong passwords** for SQL Server login
2. **Restrict IP access** if possible (in Cloudflare settings)
3. **Enable SQL Server encryption**
4. **Regularly update** cloudflared

### Railway Security

1. **Never commit** `.env` to GitHub
2. **Use Railway secrets** for sensitive data
3. **Enable 2FA** on GitHub account
4. **Review Railway access logs** regularly

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Railway | $5/month credit (free tier) |
| Cloudflare Tunnel | FREE forever |
| GitHub | FREE |
| SQL Server | FREE (already running locally) |
| **Total** | **$0** (within Railway free tier) |

**Railway Free Tier Limits:**
- $5/month credit
- ~500 hours/month execution time
- Suitable for small-medium traffic apps

---

## Alternative: Use ngrok (Simpler but Less Reliable)

If you want a quicker test setup:

```powershell
# Download ngrok: https://ngrok.com/download
# Install and authenticate

# Expose SQL Server
ngrok tcp 1433

# Copy the forwarding address (e.g., 0.tcp.ngrok.io:12345)
# Use this in Railway's DB_HOST environment variable
```

**Note:** ngrok free tier changes URL on restart, so Cloudflare Tunnel is better for production.

---

## Next Steps

1. ✅ Setup Cloudflare Tunnel
2. ✅ Configure SQL Server
3. ✅ Push to GitHub
4. ✅ Deploy to Railway
5. ✅ Test thoroughly
6. 📝 Monitor logs and performance
7. 🚀 Share with users!

---

## Support

**Need help?**
- Railway Discord: https://discord.gg/railway
- Cloudflare Community: https://community.cloudflare.com
- Laravel Docs: https://laravel.com/docs

**Common Issues:**
- Check Railway logs for errors
- Verify tunnel is running: `cloudflared tunnel info tdfc-companion-app`
- Test SQL Server connection locally first
