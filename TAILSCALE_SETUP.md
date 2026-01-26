# Tailscale Setup Guide

## What is Tailscale?

Tailscale is a free, modern VPN solution built on WireGuard technology. It provides:
- **Static IPs** - Your devices get permanent addresses on the Tailscale network
- **Fast** - Based on WireGuard, extremely fast encryption
- **Reliable** - No port changes, connections persist
- **Free** - Free tier includes unlimited devices for 1 user
- **Easy** - Minimal configuration, works out of the box

## Prerequisites

- Your local Windows machine with SQL Server (1433)
- A remote machine/server that needs to connect
- Admin access to install Tailscale
- A Tailscale account (free)

## Installation

### Step 1: Create a Tailscale Account

1. Go to [tailscale.com](https://tailscale.com)
2. Click **Sign Up** (free)
3. Choose your provider (Google, GitHub, Microsoft, or email)
4. Complete the registration
5. You now have your Tailscale account

### Step 2: Install Tailscale on Your Local Windows Machine

1. Go to [tailscale.com/download](https://tailscale.com/download)
2. Download **Windows** installer
3. Run the installer and follow prompts
4. Accept all permissions and network adapter installation
5. After installation, a browser window opens to authenticate
6. Click **Connect** to join your Tailscale network
7. You'll see your device added to your network

### Step 3: Get Your Local Machine's IP

1. Open [tailscale.com/admin/machines](https://tailscale.com/admin/machines) (or click your profile → Machines)
2. Find your Windows machine in the list
3. Note its **Tailscale IP** (e.g., `100.120.45.67`)
   - This IP is now permanent and won't change

### Step 4: Configure Your SQL Server

1. Open **SQL Server Configuration Manager**
2. Enable **TCP/IP** (if not already)
3. Right-click **TCP/IP** → **Properties**
4. Ensure listening on port `1433` on all adapters

### Step 5: Install Tailscale on Remote Machine

1. Go to [tailscale.com/download](https://tailscale.com/download)
2. Download for your remote machine's OS (Windows, Mac, Linux, etc.)
3. Install and run
4. After install, a browser opens - click **Connect**
5. Sign in with the same Tailscale account
6. Authorize the device when prompted

### Step 6: Verify Tailscale Connection

1. Go to [tailscale.com/admin/machines](https://tailscale.com/admin/machines)
2. You should see **both machines** listed
3. Both should show their Tailscale IPs (100.x.x.x)
4. Status should show as **Online**

### Step 7: Test Connection

On your remote machine, verify connectivity:

```powershell
# Windows PowerShell
Test-NetConnection -ComputerName 100.120.45.67 -Port 1433

# If successful, you'll see:
# TcpTestSucceeded : True
```

## Connect to SQL Server from Remote Machine

### Using SQL Server Management Studio (SSMS)

1. Open SSMS on your remote machine
2. **Server name:** `100.120.45.67,1433` (your local machine's Tailscale IP)
3. **Authentication:** SQL Server Authentication
4. **Login:** your SQL Server credentials
5. Click **Connect**

### Using Connection String (Laravel .env)

If your Laravel app is on the remote machine:

```env
DB_CONNECTION=sqlsrv
DB_HOST=100.120.45.67
DB_PORT=1433
DB_DATABASE=your_database
DB_USERNAME=sa
DB_PASSWORD=your_password
```

Then run:
```bash
php artisan migrate
php artisan serve
```

### Using Connection String (Python)

```python
import pyodbc

connection_string = 'Driver={ODBC Driver 17 for SQL Server};Server=100.120.45.67,1433;Database=your_db;UID=sa;PWD=password'
conn = pyodbc.connect(connection_string)
cursor = conn.cursor()
cursor.execute("SELECT @@version")
print(cursor.fetchone())
```

### Using Connection String (Node.js)

```javascript
const sql = require('mssql');

const config = {
  server: '100.120.45.67',
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

sql.connect(config).then(pool => {
  return pool.request()
    .query('SELECT @@version')
}).then(result => {
  console.log(result.recordset)
}).catch(err => {
  console.log('Database connection failed:', err)
})
```

### Using Connection String (.NET/C#)

```csharp
using System;
using System.Data.SqlClient;

class Program {
    static void Main() {
        string connectionString = "Server=100.120.45.67,1433;Database=your_db;User Id=sa;Password=password;";
        
        using (SqlConnection conn = new SqlConnection(connectionString)) {
            conn.Open();
            SqlCommand cmd = new SqlCommand("SELECT @@version", conn);
            SqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read()) {
                Console.WriteLine(reader[0]);
            }
        }
    }
}
```

## Troubleshooting

### Tailscale Not Running

1. Check system tray for Tailscale icon
2. If missing, start manually:
   ```powershell
   # Windows
   Start-Service TailscaleService
   ```
3. Or restart your computer

### Can't Connect to SQL Server from Remote

1. **Verify Tailscale is connected on both machines:**
   - Go to [tailscale.com/admin/machines](https://tailscale.com/admin/machines)
   - Both machines should show **Online** status

2. **Check SQL Server is running:**
   ```powershell
   net start MSSQL$SQLEXPRESS
   ```

3. **Check Windows Firewall allows SQL Server:**
   ```powershell
   # Allow SQL Server
   netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=tcp localport=1433 enable=yes
   ```

4. **Test connection manually:**
   ```powershell
   $ip = "100.120.45.67"
   $port = 1433
   $tcpClient = New-Object System.Net.Sockets.TcpClient
   $tcpClient.Connect($ip, $port)
   if ($tcpClient.Connected) { Write-Host "Connected!" } else { Write-Host "Failed!" }
   ```

### Slow Connection

- Tailscale is usually very fast (WireGuard-based)
- If slow, check internet bandwidth
- Try disabling IPv6 in network settings
- Restart Tailscale: right-click icon → **Pause** → **Resume**

### Machine Not Appearing in Tailscale

1. Check if Tailscale is running
2. Try signing out and signing back in:
   ```powershell
   tailscale logout
   tailscale up
   ```
3. Restart the Tailscale service:
   ```powershell
   Restart-Service TailscaleService
   ```

### Authentication Error When Connecting

1. Verify your SQL Server login credentials are correct
2. Ensure **SQL Server Authentication** is enabled:
   - Open SQL Server Management Studio (on local machine)
   - Right-click server → **Properties** → **Security**
   - Set to **SQL Server and Windows Authentication mode**
3. Restart SQL Server service

## Tailscale Admin Features

### View Your Network

1. Go to [tailscale.com/admin](https://tailscale.com/admin)
2. **Machines** tab - see all connected devices
3. **DNS** - configure custom DNS names
4. **Keys** - manage authentication keys

### Set DNS Names

1. Go to **DNS** tab
2. Click **Add split DNS nameserver** to route traffic
3. Or use **Global nameservers** for all traffic

### Manage Access (ACL)

For advanced permissions (free tier has basic settings):
1. Go to **Access controls**
2. Define who can access what
3. Default is all devices can reach each other

## Security Notes

- **Encryption:** Uses WireGuard protocol with strong encryption
- **Private Network:** Only you and authorized devices can access
- **No Public Exposure:** Your SQL Server is never exposed to the internet
- **Traffic:** All encrypted, not visible to ISP or network administrators
- **Device Management:** Deauthorize old devices in Machines tab

## Summary

**Local Machine:**
- Tailscale IP: `100.120.45.67` (example - yours will be different)
- SQL Server: Listening on port `1433`

**Remote Machine Connection:**
- Connect to: `100.120.45.67:1433`
- Use your SQL Server credentials
- Connection is encrypted and fast

**Key Benefits:**
- ✅ Static IP - never changes
- ✅ No ngrok needed
- ✅ Completely free (1 user, unlimited devices)
- ✅ Fast and reliable
- ✅ Simple setup (5 minutes)
- ✅ Secure by default

## Railway Integration

Once you have Tailscale set up locally, you can connect your Railway-deployed Laravel app to your local SQL Server.

### Quick Steps

1. **Get your Local Machine's Tailscale IP** (e.g., `100.120.45.67`)
   - From [tailscale.com/admin/machines](https://tailscale.com/admin/machines)

2. **Generate Auth Key for Railway**
   - Go to [tailscale.com/admin/settings/keys](https://tailscale.com/admin/settings/keys)
   - Click **Generate auth key**
   - Keep it **NOT ephemeral** and **reusable**
   - Copy the key: `tskey-auth-XXXXXXXXXXXXXXXXXXXXX`

3. **Update your Dockerfile** to install Tailscale:
   ```dockerfile
   RUN apt-get update && apt-get install -y tailscale && rm -rf /var/lib/apt/lists/*
   COPY start-tailscale.sh /usr/local/bin/start-tailscale.sh
   RUN chmod +x /usr/local/bin/start-tailscale.sh
   ENTRYPOINT ["/usr/local/bin/start-tailscale.sh"]
   CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
   ```

4. **Create `start-tailscale.sh`**:
   ```bash
   #!/bin/bash
   tailscaled &
   sleep 2
   tailscale up --authkey=$TAILSCALE_AUTH_KEY --hostname=railway-laravel
   exec "$@"
   ```

5. **Add to Railway Variables**:
   ```
   TAILSCALE_AUTH_KEY=tskey-auth-XXXXXXXXXXXXXXXXXXXXX
   DB_HOST=100.120.45.67
   DB_PORT=1433
   ```

6. **Deploy**:
   ```bash
   git add .
   git commit -m "Add Tailscale integration"
   git push
   ```

📖 **Full Guide:** See [RAILWAY_TAILSCALE_ZEROTIER_INTEGRATION.md](RAILWAY_TAILSCALE_ZEROTIER_INTEGRATION.md) for complete setup instructions.

---

## Comparison: ZeroTier vs Tailscale

| Feature | Tailscale | ZeroTier |
|---------|-----------|----------|
| Setup Time | 5 minutes | 10 minutes |
| Speed | Very Fast (WireGuard) | Very Fast (P2P) |
| Free Tier | Unlimited devices | Unlimited devices |
| Ease | Simpler | Slightly complex |
| Learning Curve | Minimal | Minimal |
| Admin Interface | Excellent | Good |
| Best For | Quick setup | Full control |
| Railway Setup | ✅ Easiest | ✅ Also works |

**Recommendation:** If you want the fastest setup, use **Tailscale**. Both are excellent.

