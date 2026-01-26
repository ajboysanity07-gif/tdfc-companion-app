# ZeroTier Setup Guide

## What is ZeroTier?

ZeroTier is a free, open-source VPN solution that creates a private network between your devices. It provides:
- **Static IPs** - Your devices always have the same IP on the ZeroTier network
- **Fast** - Direct peer-to-peer connections when possible
- **Reliable** - No port changes, no configuration updates needed
- **Free** - Unlimited devices and networks on free tier

## Prerequisites

- Your local Windows machine with SQL Server (1433)
- A remote machine/server (laptop, cloud VM, etc.) that needs to connect
- Admin access to install ZeroTier

## Installation

### Step 1: Create a ZeroTier Account & Network

1. Go to [zerotier.com](https://www.zerotier.com)
2. Sign up for a free account
3. Go to **Networks** → **Create Network**
   - Network name: `TDFC-Network` (or whatever you prefer)
   - Copy the **Network ID** (16-digit hex code) - you'll need this
4. Keep this page open - you'll need to authorize devices here

### Step 2: Install ZeroTier on Your Local Windows Machine

1. Download from [zerotier.com/download](https://www.zerotier.com/download)
2. Run the installer and follow prompts
3. Accept the Virtual Network Adapter installation
4. ZeroTier will start automatically

### Step 3: Join the Network on Local Machine

1. Open **ZeroTier One** (in system tray or start menu)
2. Click the ZeroTier icon in system tray
3. Select **Join Network**
4. Paste your **Network ID** and click **Join**
5. Go back to [zerotier.com/networks](https://zerotier.com/networks) 
6. Find your network → **Members** tab
7. You should see your Windows machine listed
8. **Check the checkbox** to authorize it (✓ Auth column)
9. Note the **Managed IPs** assigned (e.g., `192.168.193.45`)

### Step 4: Configure Your SQL Server

1. Open **SQL Server Configuration Manager**
2. Ensure **TCP/IP** is enabled
3. Right-click **TCP/IP** → **Properties**
4. Ensure it's listening on all adapters on port `1433`

### Step 5: Install ZeroTier on Remote Machine

1. Go to [zerotier.com/download](https://www.zerotier.com/download)
2. Download for your remote machine's OS
3. Install and start ZeroTier
4. Join the same network using your **Network ID**

### Step 6: Authorize Remote Machine

1. Go to [zerotier.com/networks](https://zerotier.com/networks)
2. Click your network → **Members**
3. Find your remote machine
4. Check the **Auth** checkbox to authorize it
5. Note its **Managed IP** (e.g., `192.168.193.120`)

### Step 7: Verify Connection

On your remote machine, test the connection:

```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName 192.168.193.45 -Port 1433

# Linux/Mac
telnet 192.168.193.45 1433
```

You should get a successful connection.

## Connect to SQL Server from Remote Machine

### Using SQL Server Management Studio (SSMS)

1. Open SSMS on your remote machine
2. **Server name:** `192.168.193.45,1433` (your local machine's ZeroTier IP)
3. **Authentication:** SQL Server Authentication
4. **Login:** your SQL Server credentials
5. Click **Connect**

### Using Connection String (Laravel .env)

If your Laravel app is on the remote machine:

```env
DB_CONNECTION=sqlsrv
DB_HOST=192.168.193.45
DB_PORT=1433
DB_DATABASE=your_database
DB_USERNAME=sa
DB_PASSWORD=your_password
```

### Using Connection String (Python, Node.js, etc.)

```python
# Python
import pyodbc
conn = pyodbc.connect('Driver={ODBC Driver 17 for SQL Server};Server=192.168.193.45,1433;Database=your_db;UID=sa;PWD=password')
```

```javascript
// Node.js
const config = {
  server: '192.168.193.45',
  port: 1433,
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'password'
    }
  },
  options: {
    database: 'your_database',
    encrypt: true,
    trustServerCertificate: true
  }
};
```

## Troubleshooting

### Can't Connect to SQL Server

1. **Check ZeroTier status:**
   - Right-click ZeroTier tray icon → **Show** 
   - Verify you're connected to the network
   - Verify your IP is listed

2. **Check Windows Firewall:**
   ```powershell
   # Allow SQL Server through firewall
   netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow program="C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\BINN\sqlservr.exe" enable=yes
   ```

3. **Check SQL Server is running:**
   ```powershell
   # Start SQL Server
   net start MSSQL$SQLEXPRESS
   ```

4. **Test connectivity:**
   ```powershell
   Test-NetConnection -ComputerName 192.168.193.45 -Port 1433 -Verbose
   ```

### ZeroTier Not Starting

1. Uninstall and reinstall
2. Run installer as Administrator
3. Accept virtual network adapter when prompted

### Slow Performance

- ZeroTier is usually very fast
- If slow, check your internet connection
- Direct peer-to-peer connections are fastest (same network)
- Relay servers may be used if direct connection not possible

## Network Management

### View Connected Devices

1. Go to [zerotier.com/networks](https://zerotier.com/networks)
2. Click your network
3. See all authorized members and their IPs

### Add More Machines

Simply repeat Steps 5-6 for each new machine you want to add.

### Network Settings

On network page, you can configure:
- **Easy routes:** `Managed Routes` for additional routing
- **Manage routes:** Advanced network configuration
- **Remove members:** Deauthorize or delete devices

## Security Notes

- ZeroTier uses modern encryption (AES-256)
- Only authorized devices can access the network
- Traffic is encrypted end-to-end
- Keep your Network ID private
- Deauthorize devices you no longer need

## Railway Integration

Once you have ZeroTier set up locally, you can connect your Railway-deployed Laravel app to your local SQL Server.

### Quick Steps

1. **Get your Local Machine's ZeroTier IP** (e.g., `192.168.193.45`)
   - From [zerotier.com/admin/networks](https://zerotier.com/admin/networks) → Members tab

2. **Get your Network ID** (16-digit hex code)
   - Example: `af342d05d07a88a9`

3. **Update your Dockerfile** to install ZeroTier:
   ```dockerfile
   RUN apt-get update && apt-get install -y curl gnupg && \
       curl -s https://raw.githubusercontent.com/zerotier/ZeroTierOne/master/doc/linux-install.sh | bash
   COPY start-zerotier.sh /usr/local/bin/start-zerotier.sh
   RUN chmod +x /usr/local/bin/start-zerotier.sh
   ENTRYPOINT ["/usr/local/bin/start-zerotier.sh"]
   CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
   ```

4. **Create `start-zerotier.sh`**:
   ```bash
   #!/bin/bash
   zerotier-one -d
   sleep 3
   zerotier-cli join $ZEROTIER_NETWORK_ID
   for i in {1..30}; do
     if zerotier-cli listnetworks | grep -q "PRIVATE"; then
       break
     fi
     sleep 1
   done
   exec "$@"
   ```

5. **Add to Railway Variables**:
   ```
   ZEROTIER_NETWORK_ID=af342d05d07a88a9
   DB_HOST=192.168.193.45
   DB_PORT=1433
   ```

6. **Deploy**:
   ```bash
   git add .
   git commit -m "Add ZeroTier integration"
   git push
   ```

📖 **Full Guide:** See [RAILWAY_ZEROTIER_GUIDE.md](RAILWAY_ZEROTIER_GUIDE.md) for complete setup instructions.

---

## Summary

- **Local machine ZeroTier IP:** 192.168.193.45 (example)
- **Remote machine:** Connect via `192.168.193.45:1433`
- **Railway Container:** Connects via same ZeroTier network
- **No ngrok needed** - completely free and fast
- **Static IPs** - never changes unless you recreate network
- **Secure** - private network, encrypted connections
- **Railway Ready** - Docker integration included

