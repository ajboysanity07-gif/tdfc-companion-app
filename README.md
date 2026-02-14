# TDFCapp – Railway Pro Deployment (Laravel 12 + Inertia React)

Production-focused Docker setup for Laravel 12 (PHP 8.3) with Inertia React, optional SSR, Cloudflare R2 storage, and SQL Server over Tailscale userspace networking.

## What the container does
- Builds frontend (Vite) and SSR bundle during the Docker build.
- Requires `APP_KEY` (no runtime key generation), defaults to `APP_ENV=production`, `APP_DEBUG=false`, `LOG_CHANNEL=stderr`.
- Makes `storage/` and `bootstrap/cache/` writable and caches config/views.
- Optionally starts Inertia SSR (`php artisan inertia:start-ssr`) when enabled via env.
- Starts Tailscale in userspace mode when `TS_AUTHKEY` is provided, forwards SQL Server traffic from the tailnet to `127.0.0.1:LOCAL_DB_PORT` (default `11433`) via SOCKS5, and pins Laravel DB env to the local forward.
- Keeps all state ephemeral (no reliance on persistent disk).

## Deploying to Railway (Dockerfile)
1) Create a Railway service using the repo Dockerfile.
2) Set the environment variables below (Secrets tab for sensitive values).
3) Deploy. The container listens on `0.0.0.0:$PORT` (Railway injects `PORT`).

### Required Railway variables
- Laravel: `APP_KEY` (generated locally), `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=<public-url>`, `LOG_CHANNEL=stderr`.
- Caching: `CACHE_STORE=database` (or your preference), `QUEUE_CONNECTION=database`, `SESSION_DRIVER=database` (or cookie).
- Database (SQL Server): `DB_CONNECTION=sqlsrv`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`. `DB_HOST`/`DB_PORT` are set by the start script when Tailscale forwarding is active.
- Optional migrations: set `RUN_MIGRATIONS=true` only when you explicitly want migrations to run on deploy.

### Tailscale + SQL Server forward (userspace)
- Env needed: `TS_AUTHKEY`, optional `TS_HOSTNAME` (default `railway-app`), `TS_TAGS` (default `tag:railway-app`), `TAILNET_DB_HOST` (MagicDNS or 100.x), `TAILNET_DB_PORT` (default `1433`), `LOCAL_DB_PORT` (default `11433`), `TS_SOCKS5_PORT` (default `1055`).
- Flow: `tailscaled --tun=userspace-networking` → `tailscale up --accept-routes=false --accept-dns=true --advertise-tags` → `socat TCP-LISTEN:${LOCAL_DB_PORT} SOCKS4A:127.0.0.1:${TAILNET_DB_HOST}:${TAILNET_DB_PORT},socksport=${TS_SOCKS5_PORT}`.
- DB env forced to local forward when Tailscale runs: `DB_CONNECTION=sqlsrv`, `DB_HOST=127.0.0.1`, `DB_PORT=${LOCAL_DB_PORT}`; `DATABASE_URL` is rewritten to use the local host/port.
- If `TS_AUTHKEY` is absent, Tailscale and forwarding are skipped so you can connect directly using `DB_HOST/DB_PORT`.

### Cloudflare R2 (S3-compatible)
- Set: `FILESYSTEM_DISK=r2`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION=auto`, `AWS_BUCKET`, `AWS_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com`, `AWS_USE_PATH_STYLE_ENDPOINT=true`, optional `AWS_URL` for public base URL. `R2_*` envs remain as fallbacks.
- R2 uses the S3 driver with private visibility by default; use signed URLs when public access is required.
- Production uploads should not assume persistent local disk; use R2 for durable storage.

### Inertia SSR (optional toggle)
- Default: disabled. Env to enable: `INERTIA_SSR_ENABLED=true`, `SSR_HOST=127.0.0.1`, `SSR_PORT=13714`, `INERTIA_SSR_URL=http://127.0.0.1:13714`. Bundle path can be overridden with `INERTIA_SSR_BUNDLE` if needed.
- Docker build already runs `npm run build` and `npm run build --ssr`; the start script will launch `php artisan inertia:start-ssr` when SSR is enabled.

### Runtime hardening
- `APP_KEY` is mandatory; container exits if missing.
- Uses `config:cache` and `view:cache`; route caching is intentionally skipped because routes still include closures.
- Logs to stderr; nginx access/error logs go to stdout/stderr.
- No reliance on persistent volumes; Tailscale state lives in `/tmp/tailscale`.

## Local notes
- If you do not see frontend changes in the UI, run `npm run build` or `npm run dev` locally.
- For production-like checks, run `npm run build && npm run build --ssr` and `composer install --no-dev` before building the image.

