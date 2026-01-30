# TDFC Railway Deployment

## Setup Instructions

1. **Set Railway Environment Variables** (required)
   - Go to Railway dashboard → Project settings → Variables
   - Add these variables:
     ```
     APP_NAME=TDFC
     APP_ENV=production
     APP_DEBUG=false
     APP_URL=https://your-app.railway.app
     APP_KEY=base64:XXXXX (generate with: php artisan key:generate --show)
     
     DB_CONNECTION=sqlsrv
     DB_HOST=100.100.54.27
     DB_PORT=1433
     DB_DATABASE=rbank1
     DB_USERNAME=AJ-admin
     DB_PASSWORD=@T3mp123!
     DB_ENCRYPT=no
     DB_TRUST_SERVER_CERTIFICATE=yes
     
     TAILSCALE_AUTHKEY=your-auth-key-from-tailscale-admin
     ```

2. **Generate Tailscale Auth Key**
   - Go to https://login.tailscale.com/admin/settings/keys
   - Create a new ephemeral key (30-day expiration recommended)
   - Copy the key and set as `TAILSCALE_AUTHKEY` in Railway

3. **Deploy**
   - Push to master branch on GitHub
   - Railway automatically deploys on git push
   - Check railway.toml for build configuration

## Architecture

```
GitHub → Railway Build (Docker) → Tailscale Network ← SQL Server
         └─ Dockerfile: Build PHP app
         └─ start-tailscale.sh: Connect to Tailscale
         └─ start-container.sh: Start Apache
```

## Troubleshooting

- **Tailscale connection fails**: Check auth key has permissions (Settings → Keys)
- **Database connection times out**: Verify SQL Server is accessible from Tailscale IP 100.100.54.27
- **Build fails**: Check docker build logs in Railway dashboard
