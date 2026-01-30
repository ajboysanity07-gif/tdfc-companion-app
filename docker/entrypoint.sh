#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/html"
PORT="${PORT:-8080}"

TS_STATE_DIR="${TS_STATE_DIR:-/var/lib/tailscale}"
TS_SOCKET="${TS_SOCKET:-/var/run/tailscale/tailscaled.sock}"
TS_HOSTNAME="${TS_HOSTNAME:-}"
TS_TAGS="${TS_TAGS:-}"
TS_AUTHKEY="${TS_AUTHKEY:-}"
TS_TUN="${TS_TUN:-kernel}"
TS_ACCEPT_DNS="${TS_ACCEPT_DNS:-true}"

cd "${APP_DIR}"

# Ensure writable cache directories for Laravel
chown -R www-data:www-data "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache"

# Render nginx config with runtime PORT
export PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

if [ "${TS_DISABLE:-}" != "1" ]; then
    echo "Starting tailscaled..."
    mkdir -p "${TS_STATE_DIR}" /var/run/tailscale

    TAILSCALED_ARGS=(--state="${TS_STATE_DIR}/tailscaled.state" --socket="${TS_SOCKET}")
    if [ "${TS_TUN}" = "userspace" ]; then
        TAILSCALED_ARGS+=(--tun=userspace-networking)
    fi

    tailscaled "${TAILSCALED_ARGS[@]}" &

    for i in $(seq 1 30); do
        if tailscale --socket="${TS_SOCKET}" status >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    TS_STATUS="$(tailscale --socket="${TS_SOCKET}" status --json 2>/dev/null || true)"
    if echo "${TS_STATUS}" | grep -q '"BackendState":"Running"'; then
        echo "Tailscale already authenticated."
    else
        if [ -z "${TS_AUTHKEY}" ]; then
            echo "TS_AUTHKEY not set; skipping tailscale up."
        else
            TS_UP_ARGS=()
            if [ -n "${TS_HOSTNAME}" ]; then
                TS_UP_ARGS+=(--hostname="${TS_HOSTNAME}")
            fi
            if [ -n "${TS_TAGS}" ]; then
                TS_UP_ARGS+=(--advertise-tags="${TS_TAGS}")
            fi
            if [ "${TS_ACCEPT_DNS}" = "true" ]; then
                TS_UP_ARGS+=(--accept-dns=true)
            else
                TS_UP_ARGS+=(--accept-dns=false)
            fi

            echo "Authenticating Tailscale..."
            tailscale --socket="${TS_SOCKET}" up --authkey="${TS_AUTHKEY}" "${TS_UP_ARGS[@]}"
        fi
    fi
fi

gosu www-data php artisan config:cache
gosu www-data php artisan view:cache

case "${RUN_MIGRATIONS:-}" in
    1|true|TRUE|yes|YES)
        echo "Running migrations..."
        gosu www-data php artisan migrate --force
        ;;
esac

php-fpm -D
exec gosu www-data nginx -g "daemon off;"
