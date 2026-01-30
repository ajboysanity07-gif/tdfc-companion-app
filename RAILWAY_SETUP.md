# Railway Environment Setup Instructions

## Setting Database Connection via Tailscale

Your Laravel application is deployed on Railway and needs to connect to SQL Server on your local machine via Tailscale.

### Step 1: Get Your SQL Server's Tailscale IP
From the Tailscale status you showed:
- **SQL Server Machine**: desktop-eqrdmc9 (Windows 11)
- **Tailscale IP**: `100.100.54.27`

### Step 2: Configure Railway Environment Variables

1. Go to your Railway project dashboard
2. Click on the **"tdfc-companion-app-production"** service
3. Go to the **"Variables"** tab
4. Add these environment variables:

```
DB_CONNECTION=sqlsrv
DB_HOST=100.100.54.27
DB_PORT=1433
DB_DATABASE=rbank1
DB_USERNAME=AJ-admin
DB_PASSWORD=@T3mp123!
DB_ENCRYPT=no
DB_TRUST_SERVER_CERTIFICATE=yes
```

### Step 3: Redeploy

1. Click the **"Deploy"** button or push a new commit to trigger a redeploy
2. Wait for the deployment to complete
3. The application should now connect to your SQL Server via Tailscale

### Troubleshooting

If you still see "Login timeout expired":

1. **Verify Tailscale connectivity**: 
   - Make sure your desktop machine is connected to Tailscale
   - Check the Tailscale admin console that your devices can reach each other

2. **Verify SQL Server is listening on 1433**:
   - On your desktop, run: `netstat -an | findstr 1433`
   - Should show SQL Server listening on that port

3. **Check firewall**:
   - Make sure Windows Firewall isn't blocking port 1433
   - SQL Server should be accessible via Tailscale network

4. **Verify credentials**:
   - Username: `AJ-admin`
   - Password: `@T3mp123!`
   - Database: `rbank1`

### Connection Flow

```
Railway Container (100.86.103.59)
    ↓ [Tailscale Network]
    ↓
Your Desktop (100.100.54.27)
    ↓ [SQL Server on port 1433]
    ↓
SQL Server (rbank1)
```

All communication is encrypted through Tailscale - no external services needed!
