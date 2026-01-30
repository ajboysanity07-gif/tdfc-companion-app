# TDFCapp

## Deploying to Railway + SQL Server over Tailscale

1. Create a Railway project and choose Dockerfile-based deployment.
2. Add a Railway persistent volume mounted at `/var/lib/tailscale` so the Tailscale machine identity survives redeploys.
3. Set Railway variables (secrets go in the Secrets tab) using the tables below.
4. Create a reusable or pre-authorized Tailscale auth key and (optionally) restrict it with tags (for example `tag:railway`).
5. Deploy. The container will start Tailscale, cache Laravel config/views, and then start nginx + php-fpm.

Environment variables

Laravel
- `APP_KEY`: Laravel app key (generate with `php artisan key:generate` locally).
- `APP_ENV`: `production`.
- `APP_URL`: public Railway URL.
- `LOG_CHANNEL`: `stack` (or your preferred channel).
- `CACHE_STORE`: `file` or `database` (CACHE setting).
- `QUEUE_CONNECTION`: `sync` or `database` (QUEUE setting).
- `SESSION_DRIVER`: `cookie` or `database` (SESSION setting).
- `RUN_MIGRATIONS`: set to `true` only when you want migrations to run on deploy.

SQL Server (over Tailscale)
- `DB_CONNECTION`: `sqlsrv`.
- `DB_HOST`: Tailscale IP or MagicDNS name of the SQL Server.
- `DB_PORT`: `1433`.
- `DB_DATABASE`: database name.
- `DB_USERNAME`: SQL Server username.
- `DB_PASSWORD`: SQL Server password (secret).

Tailscale
- `TS_AUTHKEY`: auth key (secret).
- `TS_HOSTNAME`: stable hostname (example: `tdfc-railway-6`). If unset, a deterministic name is derived from the Railway service or project name.
- `TS_TAGS`: optional comma-separated tags (example: `tag:railway`).
- `TS_STATE_DIR`: persistent state path (default `/var/lib/tailscale`).

## Railway Hobbyist + Tailscale

1. Set `TS_AUTHKEY`, `TS_HOSTNAME`, and optional `TS_TAGS`.
2. Mount a Railway persistent volume at `/var/lib/tailscale` (or match your `TS_STATE_DIR`) to keep the same Tailscale node across redeploys. If volumes are unavailable, persistent identity cannot be guaranteed.
3. If using tags, ensure `tag:railway` is allowed in Tailscale ACL `tagOwners` or the auth key permits it; otherwise omit `TS_TAGS`.

Notes
- This setup runs Tailscale in userspace networking mode on Railway Hobbyist (no `/dev/net/tun`).
- Secrets must be injected via Railway variables. Do not commit `.env` files with credentials.
