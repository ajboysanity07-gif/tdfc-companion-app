# TDFCapp

## Deploying to Railway + SQL Server over Tailscale

1. Create a Railway project and choose Dockerfile-based deployment.
2. Add a Railway persistent volume mounted at `/var/lib/tailscale` so the Tailscale machine identity survives redeploys.
3. Set Railway variables (secrets go in the Secrets tab) using the tables below.
4. Create a reusable or pre-authorized Tailscale auth key and restrict it with tags (for example `tag:railway`).
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
- `TS_HOSTNAME`: stable hostname (example: `tdfc-railway-6`).
- `TS_TAGS`: comma-separated tags (example: `tag:railway`).
- `TS_STATE_DIR`: persistent state path (default `/var/lib/tailscale`).
- `TS_TUN`: set to `userspace` only if Railway does not allow TUN (see note below).

Notes
- This setup expects kernel TUN support for direct SQL Server connectivity. If Railway does not allow `/dev/net/tun` and `NET_ADMIN`, use a Tailscale subnet router or connector service and point `DB_HOST` at that Tailscale endpoint.
- Secrets must be injected via Railway variables. Do not commit `.env` files with credentials.
