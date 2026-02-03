# Deploy to Railway via Tailscale (SQL Server)

This guide documents the correct, working steps for deploying this app to Railway with SQL Server access over Tailscale, based on the current Docker/Tailscale setup in this repo.

## Prerequisites

- Railway account and a Dockerfile-based project.
- A Tailscale tailnet where your SQL Server is already reachable.
- A Tailscale auth key (reusable or ephemeral).
- SQL Server credentials and database name.

## 1) Prepare SQL Server on the tailnet

1. Install and sign in to Tailscale on the SQL Server host.
2. Confirm SQL Server listens on port 1433.
3. Note the tailnet IP (100.64.0.0/10) or MagicDNS name.
4. Allow inbound SQL Server traffic from your tailnet (firewall/SQL Server configuration).

## 2) Create the Railway service

1. Create a Railway project.
2. Choose a Dockerfile-based deployment and point it at this repo.
3. Confirm the root Dockerfile is used (no custom path needed).

## 3) Add a persistent volume for Tailscale

1. Add a Railway volume and mount it at `/var/lib/tailscale`.
2. This keeps the Tailscale identity stable across redeploys.

## 4) Configure Railway variables

Set these in Railway Variables/Secrets (do not commit `.env`).

### Laravel

- `APP_KEY`: your Laravel key (`php artisan key:generate` locally).
- `APP_ENV`: `production`.
- `APP_URL`: your Railway public URL (example: `https://your-app.up.railway.app`).
- `LOG_CHANNEL`: `stack` (or your preferred channel).
- `RUN_MIGRATIONS`: `true` only when you want migrations to run on deploy.

### SQL Server (over Tailscale)

- `DB_CONNECTION`: `sqlsrv`.
- `DB_HOST`: tailnet IP (recommended) or MagicDNS name.
- `DB_PORT`: `1433`.
- `DB_DATABASE`: SQL Server database name.
- `DB_USERNAME`: SQL Server username.
- `DB_PASSWORD`: SQL Server password.
- `DB_TRUST_SERVER_CERTIFICATE`: `true` (if your SQL Server uses self-signed certs).

### Tailscale

- `TS_AUTHKEY`: your Tailscale auth key.
- `TS_HOSTNAME`: a stable hostname (example: `tdfc-railway-6`).
- `TS_STATE_DIR`: `/var/lib/tailscale`.
- `TS_DB_PROXY`: `auto` (default), `1` to force, `0` to disable.
- `TS_SOCKS5_HOST`: `127.0.0.1` (optional; default used when proxying).
- `TS_SOCKS5_PORT`: `1055` (optional; default used when proxying).

Notes:
- If `DB_HOST` is a tailnet IP in the 100.64.0.0/10 range, `TS_DB_PROXY=auto` enables the proxy automatically.
- If `DB_HOST` is a MagicDNS name, set `TS_DB_PROXY=1` to force the proxy.
- If you do not use ACL tags, do not set `TS_TAGS`.
- The entrypoint starts `tailscaled` in userspace mode and binds a local SOCKS5 listener at `127.0.0.1:1055`. A local TCP forwarder then maps `127.0.0.1:1433` to your SQL Server over Tailscale.

## 5) Deploy

1. Trigger a Railway deploy (or push to the tracked branch).
2. Wait for the container to start.

## 6) Verify in logs

Look for these lines:

- `Starting tailscaled...`
- `Tailscale authenticated with IP ...`
- `Starting Tailscale DB proxy on 127.0.0.1:1433...`
- `NOTICE: ready to handle connections`

If those appear, the app should connect to SQL Server and the UI should load normally.

## 7) Quick validation checklist

- The Railway build completes without errors.
- The container logs show Tailscale authenticated and DB proxy started.
- The app can load the client-management page without SQL errors.
- `DB_HOST` is a tailnet IP or MagicDNS name that resolves inside the tailnet.

## 8) Common issues and fixes

- `ncat not available; cannot start DB proxy.`  
  Ensure the image was rebuilt after the `ncat` install change. Trigger a full rebuild in Railway.

- `SQLSTATE[08001] ... handshakes before login`  
  Confirm SQL Server allows inbound from the tailnet, the correct port is open, and credentials are valid.

- `You are logged out` in Tailscale logs  
  Verify `TS_AUTHKEY` is set and not expired. Use a fresh auth key if needed.

- No `Starting Tailscale DB proxy...` line  
  If `DB_HOST` is MagicDNS, set `TS_DB_PROXY=1`. If using a tailnet IP, confirm it is within 100.64.0.0/10.

## 9) Security reminders

- Store secrets in Railway Secrets (not in the repo).
- Use a Tailscale auth key with the minimum scope you need.
- Rotate `TS_AUTHKEY` and DB credentials periodically.
