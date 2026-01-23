# Railway Deployment Guide (Actual Setup)
## Laravel + React on Railway + Local SQL Server via ngrok

This guide documents the **actual deployment steps** used to deploy TDFCapp to Railway using Docker and ngrok tunnel.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Desktop App    │────▶│  SQL Server      │◀────│     ngrok       │
│  (Local)        │     │  (Local Machine) │     │    Tunnel       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               ▲                           ▲
                               │                           │
                               └───────────────────────────┘
                                                           │
                                                           │
                                                  ┌─────────────────┐
                                                  │  Laravel App    │
                                                  │  (Railway.app)  │
                                                  │  Using Docker   │
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
- [x] Railway account (free)
- [x] SQL Server running locally (SSMS)
- [x] ngrok account (free tier is sufficient)
- [x] Your TDFCapp Laravel project
- [x] Node.js installed locally

---

## Part 1: Setup ngrok Tunnel (Expose Local SQL Server)

## Part 1: Setup ngrok Tunnel (Expose Local SQL Server)

### Step 1.1: Install ngrok

**Windows:**
1. Go to https://ngrok.com/download
2. Download the Windows version
3. Extract to a folder (e.g., `C:\ngrok`)
4. Add to PATH or run from that directory

### Step 1.2: Sign Up and Get Auth Token

1. Create free account at https://ngrok.com/signup
2. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
3. Authenticate ngrok:

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 1.3: Configure SQL Server for Remote Connections

**Enable TCP/IP:**
1. Open **SQL Server Configuration Manager**
2. Go to **SQL Server Network Configuration** → **Protocols for MSSQLSERVER**
3. Right-click **TCP/IP** → **Enable**
4. Right-click **TCP/IP** → **Properties** → **IP Addresses** tab
5. Scroll to **IPALL** → Set **TCP Port: 1433**
6. Click **OK** and **restart SQL Server service**

**Enable SQL Server Authentication:**
1. Open **SSMS**
2. Right-click server → **Properties** → **Security**
3. Select **SQL Server and Windows Authentication mode**
4. Click **OK** and **restart SQL Server service**

**Create SQL Login for Laravel:**
```sql
-- In SSMS, run this:
CREATE LOGIN laravel_user WITH PASSWORD = 'YourStrongPassword123!';
GO

USE tdfcdb;  -- Your actual database name
GO

CREATE USER laravel_user FOR LOGIN laravel_user;
GO

ALTER ROLE db_datareader ADD MEMBER laravel_user;
ALTER ROLE db_datawriter ADD MEMBER laravel_user;
GO
```

### Step 1.4: Start ngrok Tunnel

```powershell
# Start ngrok tunnel for SQL Server
ngrok tcp 1433
```

**Important:** Keep this terminal window open!

You'll see output like:
```
Forwarding    tcp://0.tcp.ngrok.io:12345 -> localhost:1433
```

**Copy the forwarding address** (e.g., `0.tcp.ngrok.io` and port `12345`)

---

## Part 2: Prepare Laravel App for Railway Deployment

## Part 2: Prepare Laravel App for Railway Deployment

### Step 2.1: Verify Database Configuration

Your `config/database.php` should already have:

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
    'trust_server_certificate' => true,  // Important for ngrok
],
```

### Step 2.2: Create Required Files

**1. Create `Dockerfile`** (already exists in your project):
- Uses PHP 8.3 with Apache
- Installs SQL Server drivers (sqlsrv, pdo_sqlsrv)
- Installs Node.js for building frontend assets
- Configures Apache for Railway's dynamic PORT

**2. Create `railway.toml`** (already exists):
```toml
[build]
builder = "dockerfile"
```

**3. Create `start-container.sh`** (already exists):
- Creates storage link
- Caches Laravel configs
- Configures Apache to use Railway's PORT
- Starts Apache

### Step 2.3: Build Production Assets Locally

```powershell
# Install dependencies
npm install

# Build for production
npm run build
```

**Important:** The `public/build` folder is committed to Git for Railway.

### Step 2.4: Update .gitignore

Ensure `public/build` is **NOT** ignored:
```gitignore
# Comment out or remove this line if it exists:
# /public/build
```

### Step 2.5: Push to GitHub

```powershell
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Railway deployment with Docker"

# Create GitHub repo at github.com/new
# Then push
git remote add origin https://github.com/yourusername/TDFCapp.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy to Railway

## Part 3: Deploy to Railway

### Step 3.1: Sign Up to Railway

1. Go to https://railway.app
2. Click **"Login with GitHub"**
3. Authorize Railway
4. No credit card required for free tier

### Step 3.2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub repositories
4. Choose your **TDFCapp** repository
5. Railway will detect the Dockerfile and use it for deployment

### Step 3.3: Configure Environment Variables

1. Click on your deployment/service
2. Go to **"Variables"** tab
3. Add the following variables:

**Required Variables:**
```env
APP_NAME=TDFC App
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://YOUR-APP-NAME.up.railway.app

DB_CONNECTION=sqlsrv
DB_HOST=0.tcp.ngrok.io
DB_PORT=12345
DB_DATABASE=tdfcdb
DB_USERNAME=laravel_user
DB_PASSWORD=YourStrongPassword123!

SESSION_DRIVER=file
SESSION_LIFETIME=120
FILESYSTEM_DISK=public
```

**To generate APP_KEY:**
```powershell
# Run locally
php artisan key:generate --show
# Copy the output (e.g., base64:abc123...)
```

**Important:** 
- Replace `DB_HOST` and `DB_PORT` with your ngrok tunnel address
- Replace `DB_PASSWORD` with your actual SQL Server password

### Step 3.4: Add Custom Domain (Optional)

1. Go to **"Settings"** tab
2. Click **"Generate Domain"** (Railway provides free subdomain)
3. Your app will be at: `https://your-app-name.up.railway.app`
4. Update `APP_URL` environment variable with this URL

### Step 3.5: Deploy

Railway will automatically build and deploy:
- Build time: ~5-10 minutes (first deployment)
- Uses Dockerfile to build the image
- Runs `start-container.sh` on startup

**Monitor the deployment:**
1. Click **"Deployments"** tab
2. View real-time build logs
3. Check for any errors

---

## Part 4: Configure File Storage (Profile Photos)

## Part 4: Configure File Storage (Profile Photos)

### Important: Railway uses Ephemeral Storage

By default, uploaded files (like profile photos) are stored on the container's filesystem, which is **ephemeral**. This means files are lost when the container restarts.

### Solution: Add Railway Volume

1. In Railway project, go to your service
2. Click **"Variables"** tab  
3. Scroll down to **"Volumes"** section
4. Click **"+ New Volume"**
5. Set **Mount Path**: `/app/storage/app/public`
6. Click **"Add"**

This creates a 1GB persistent volume (included in free tier).

### Verify Storage Link

The `start-container.sh` script already runs:
```bash
php artisan storage:link
```

This creates a symlink from `public/storage` → `storage/app/public`.

Profile photos are stored at:
- **Path in code**: `storage/app/public/avatars/filename.jpg`
- **Public URL**: `https://your-app.railway.app/storage/avatars/filename.jpg`

---

## Part 5: Test the Deployment

---

## Part 6: Maintenance & Updates

### Update Application Code

```powershell
# Make changes locally
git add .
git commit -m "Your changes description"
git push origin main

# Railway will automatically rebuild and redeploy (5-10 minutes)
```

### Keep ngrok Tunnel Running

**Important:** Keep the ngrok terminal window open at all times!

**Free Tier Limitations:**
- URL changes every time ngrok restarts
- When URL changes, update Railway environment variables:
  1. Start ngrok: `ngrok tcp 1433`
  2. Copy new forwarding address
  3. Update `DB_HOST` and `DB_PORT` in Railway
  4. Redeploy (Railway will restart automatically)

**Upgrade to ngrok Paid Plan ($8/month):**
- Get a static TCP address that never changes
- No need to update Railway env vars on restart

### Monitor Application

1. **Railway Logs**: Check deployment and runtime logs
2. **ngrok Dashboard**: View tunnel connections at https://dashboard.ngrok.com
3. **SQL Server**: Monitor connections in SSMS Activity Monitor

---

## Troubleshooting

## Troubleshooting

### Issue: Railway can't connect to SQL Server

**Solution:**
1. Check ngrok tunnel is running: verify the terminal shows "Session Status: online"
2. Copy the exact forwarding address from ngrok (e.g., `0.tcp.ngrok.io:12345`)
3. Update Railway environment variables with correct `DB_HOST` and `DB_PORT`
4. Verify SQL Server is running and TCP/IP enabled
5. Test connection locally first using the ngrok address

### Issue: "Login failed for user"

**Solution:**
```sql
-- In SSMS, verify user exists and has permissions:
USE tdfcdb;  -- Your database name
GO

-- Check if user exists
SELECT name FROM sys.database_principals WHERE name = 'laravel_user';

-- Grant permissions if needed
ALTER ROLE db_datareader ADD MEMBER laravel_user;
ALTER ROLE db_datawriter ADD MEMBER laravel_user;
GO
```

### Issue: ngrok URL changed and app won't connect

**Solution:**
1. Check ngrok terminal for new forwarding address
2. Go to Railway → Variables
3. Update `DB_HOST` and `DB_PORT` with new values
4. Railway will automatically restart the app

### Issue: Build fails on Railway

**Solution:**
1. Verify `Dockerfile` and `railway.toml` exist in root
2. Check `composer.json` has all required dependencies
3. Ensure `public/build` folder is committed to Git
4. Review Railway build logs for specific error messages
5. Try rebuilding: Deployments → ⋯ menu → Redeploy

### Issue: Profile photos disappear after restart

**Solution:**
1. Add a Railway Volume (see Part 4)
2. Mount path: `/app/storage/app/public`
3. Redeploy the application

### Issue: Assets (CSS/JS) not loading

**Solution:**
```bash
# Verify build folder exists
ls public/build

# Rebuild assets locally
npm run build
git add public/build
git commit -m "Add build assets"
git push
```

### Issue: Apache won't start or port errors

**Solution:**
- Check Railway logs for specific Apache errors
- Verify `start-container.sh` is executable
- Railway automatically sets `PORT` environment variable
- The startup script configures Apache to use this PORT

---

## Security Notes

### Secure Your Tunnel

1. **Use strong passwords** for SQL Server login (min 12 characters)
2. **Don't share ngrok URL publicly** (it exposes your database)
3. **Monitor ngrok dashboard** for suspicious connections
4. **Consider ngrok IP restrictions** (paid feature)

### Railway Security

1. **Never commit** `.env` files to GitHub
2. **Use strong APP_KEY** (generate new one for production)
3. **Enable 2FA** on GitHub account
4. **Review Railway access logs** regularly
5. **Set APP_DEBUG=false** in production

### SQL Server Security

1. Use SQL Server authentication with strong passwords
2. Consider VPN instead of ngrok for production
3. Regularly review SQL Server logs
4. Keep SQL Server updated with latest patches

---

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Railway | FREE | $5/month credit, ~500 hours execution |
| ngrok Free | FREE | URL changes on restart |
| ngrok Paid | $8/month | Static TCP address (recommended) |
| GitHub | FREE | Public/private repos |
| SQL Server | FREE | Already running locally |
| **Total (Free)** | **$0** | Good for testing |
| **Total (Recommended)** | **$8/month** | ngrok paid for stability |

**Railway Free Tier:**
- $5 credit/month (~500 hours)
- 1GB persistent volume included
- Enough for development/small production

**ngrok Paid Benefits:**
- Static address (no need to update Railway vars)
- Better performance and reliability
- Custom domains
- IP restrictions

---

## Production Recommendations

### For Serious Production Use

1. **Use Cloudflare Tunnel instead of ngrok** (more stable, free)
2. **Set up Railway Volume** for file uploads
3. **Use S3/Cloudinary** for profile photos (better scalability)
4. **Add monitoring** (Railway provides basic metrics)
5. **Set up backups** for SQL Server database
6. **Use a VPN** instead of public tunnel (most secure)

### Upgrading to Better Storage

Currently, profile photos are saved to:
- **Ephemeral storage** (without volume): Files lost on restart
- **Railway Volume** (with volume): 1GB persistent, single region
- **Recommended for production**: S3 or Cloudinary

See Cloudinary setup (free tier):
1. Sign up at https://cloudinary.com
2. Install: `composer require cloudinary/cloudinary_php`
3. Configure in `config/filesystems.php`
4. Update ProfileController to use Cloudinary disk

---

## Alternative: Use ngrok (Simpler but Less Reliable)

**You are currently using this method!**

```powershell
# Your current setup:
ngrok tcp 1433

# To make it more permanent:
# 1. Upgrade to ngrok paid plan ($8/month)
# 2. Reserve a TCP address
# 3. Update Railway variables once
# 4. Never worry about URL changes again
```

---

## Next Steps

## Next Steps

### Checklist

- [x] SQL Server configured for remote connections
- [x] ngrok tunnel running (keep terminal open!)
- [x] GitHub repository created and pushed
- [x] Railway project deployed with Dockerfile
- [x] Environment variables configured
- [x] Railway Volume added for persistent storage
- [x] Application tested and working

### Ongoing Tasks

1. **Keep ngrok running**: Don't close the terminal!
2. **Monitor Railway logs**: Check for errors regularly
3. **Test file uploads**: Verify profile photos persist
4. **Update code**: Push to GitHub, Railway auto-deploys
5. **Backup database**: Regular SQL Server backups

### Future Improvements

1. **Upgrade to ngrok paid** ($8/month) for stable URL
2. **Add Cloudinary** for better image storage and CDN
3. **Set up error monitoring** (Sentry, Bugsnag)
4. **Add Redis** for sessions/cache (Railway add-on)
5. **Custom domain** for professional appearance

---

## Summary

**What You've Deployed:**
- ✅ Laravel + React app on Railway (Docker-based)
- ✅ SQL Server database running locally
- ✅ ngrok tunnel connecting Railway → Local DB
- ✅ Profile photos stored in Railway Volume (persistent)
- ✅ Automatic deployments from GitHub

**Important Reminders:**
- Keep ngrok terminal window open
- ngrok URL changes on restart (update Railway vars)
- Railway Volume required for persistent file uploads
- Free tier suitable for development/testing

**Total Cost:** $0/month (within free tiers) or $8/month with ngrok paid

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **ngrok Docs**: https://ngrok.com/docs
- **Laravel Docs**: https://laravel.com/docs
- **SQL Server Docs**: https://docs.microsoft.com/sql

**Need Help?**
- Check Railway deployment logs first
- Verify ngrok tunnel is running  
- Test SQL connection locally
- Review this guide's troubleshooting section
