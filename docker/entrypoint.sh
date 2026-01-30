#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/html"
PORT="${PORT:-8080}"

TS_STATE_DIR="${TS_STATE_DIR:-/var/lib/tailscale}"
TS_STATE_FILE="${TS_STATE_DIR}/tailscaled.state"
TS_SOCKET="${TS_SOCKET:-/var/run/tailscale/tailscaled.sock}"
TS_HOSTNAME="${TS_HOSTNAME:-}"
TS_TAGS="${TS_TAGS:-}"
TS_AUTHKEY="${TS_AUTHKEY:-}"
TS_TUN="${TS_TUN:-}"
TS_NETFILTER="${TS_NETFILTER:-}"
TS_ACCEPT_DNS="${TS_ACCEPT_DNS:-true}"

cd "${APP_DIR}"

sanitize_hostname() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9-]+/-/g; s/^-+//; s/-+$//; s/-{2,}/-/g'
}

TS_HOSTNAME_ORIG="${TS_HOSTNAME}"
if [ -z "${TS_HOSTNAME}" ]; then
    if [ -n "${RAILWAY_SERVICE_NAME:-}" ]; then
        TS_HOSTNAME="$(sanitize_hostname "${RAILWAY_SERVICE_NAME}")"
    elif [ -n "${RAILWAY_PROJECT_NAME:-}" ]; then
        TS_HOSTNAME="$(sanitize_hostname "${RAILWAY_PROJECT_NAME}")"
    fi
fi
if [ -z "${TS_HOSTNAME}" ]; then
    TS_HOSTNAME="tdfc-railway"
fi
if [ -z "${TS_HOSTNAME_ORIG}" ]; then
    echo "TS_HOSTNAME not set; using derived hostname: ${TS_HOSTNAME}"
fi
if [ -n "${TS_TUN}" ] && [ "${TS_TUN}" != "userspace" ]; then
    echo "Ignoring TS_TUN=${TS_TUN}; Railway Hobbyist requires userspace networking."
fi

# Ensure writable cache directories for Laravel
chown -R www-data:www-data "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache"

# Render nginx config with runtime PORT
export PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

if [ "${TS_DISABLE:-}" != "1" ]; then
    echo "Starting tailscaled..."
    TS_SOCKET_DIR="$(dirname "${TS_SOCKET}")"
    mkdir -p "${TS_STATE_DIR}" "${TS_SOCKET_DIR}"

    if [ ! -w "${TS_STATE_DIR}" ]; then
        echo "Tailscale state dir not writable; attempting to fix permissions..."
        chown -R root:root "${TS_STATE_DIR}" 2>/dev/null || true
        chmod 700 "${TS_STATE_DIR}" 2>/dev/null || true
    fi

    if [ ! -w "${TS_STATE_DIR}" ]; then
        echo "Tailscale state dir is not writable: ${TS_STATE_DIR}"
        exit 1
    fi

    if [ ! -w "${TS_SOCKET_DIR}" ]; then
        echo "Tailscale socket dir not writable; attempting to fix permissions..."
        chown -R root:root "${TS_SOCKET_DIR}" 2>/dev/null || true
        chmod 755 "${TS_SOCKET_DIR}" 2>/dev/null || true
    fi

    if [ ! -w "${TS_SOCKET_DIR}" ]; then
        echo "Tailscale socket dir is not writable: ${TS_SOCKET_DIR}"
        exit 1
    fi

    TAILSCALED_ARGS=(--state="${TS_STATE_FILE}" --socket="${TS_SOCKET}" --tun=userspace-networking)

    tailscaled "${TAILSCALED_ARGS[@]}" &

    for i in $(seq 1 30); do
        if [ -S "${TS_SOCKET}" ] && tailscale --socket="${TS_SOCKET}" status >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    if ! tailscale --socket="${TS_SOCKET}" status >/dev/null 2>&1; then
        echo "Tailscaled did not become ready in time."
        exit 1
    fi

    TS_IP="$(tailscale --socket="${TS_SOCKET}" ip -4 2>/dev/null | head -n 1 || true)"
    if [ -n "${TS_IP}" ]; then
        echo "Tailscale already authenticated with IP ${TS_IP}."
    else
        if [ -z "${TS_AUTHKEY}" ]; then
            echo "TS_AUTHKEY not set; skipping tailscale up."
        else
            TS_UP_COMMON_ARGS=()
            TS_UP_COMMON_ARGS+=(--hostname="${TS_HOSTNAME}")
            if [ "${TS_ACCEPT_DNS}" = "true" ]; then
                TS_UP_COMMON_ARGS+=(--accept-dns=true)
            else
                TS_UP_COMMON_ARGS+=(--accept-dns=false)
            fi
            if [ -n "${TS_NETFILTER}" ]; then
                TS_UP_COMMON_ARGS+=(--netfilter-mode="${TS_NETFILTER}")
            else
                TS_UP_COMMON_ARGS+=(--netfilter-mode=off)
            fi

            TS_UP_ARGS=("${TS_UP_COMMON_ARGS[@]}")
            if [ -n "${TS_TAGS}" ]; then
                TS_UP_ARGS+=(--advertise-tags="${TS_TAGS}")
            fi

            echo "Authenticating Tailscale..."
            set +e
            TS_UP_OUTPUT="$(tailscale --socket="${TS_SOCKET}" up --authkey="${TS_AUTHKEY}" "${TS_UP_ARGS[@]}" 2>&1)"
            TS_UP_EXIT=$?
            set -e

            if [ "${TS_UP_EXIT}" -ne 0 ]; then
                echo "${TS_UP_OUTPUT}"
                if [ -n "${TS_TAGS}" ] && echo "${TS_UP_OUTPUT}" | grep -Eqi "requested tags|invalid or not permitted"; then
                    echo "Tailscale tags were rejected; retrying without tags."
                    echo "To use tags, configure tagOwners for tag:railway in the Tailscale ACL, use an auth key permitted for that tag, or omit TS_TAGS."
                    TS_UP_ARGS=("${TS_UP_COMMON_ARGS[@]}")
                    set +e
                    TS_UP_OUTPUT="$(tailscale --socket="${TS_SOCKET}" up --authkey="${TS_AUTHKEY}" "${TS_UP_ARGS[@]}" 2>&1)"
                    TS_UP_EXIT=$?
                    set -e
                    if [ "${TS_UP_EXIT}" -ne 0 ]; then
                        echo "${TS_UP_OUTPUT}"
                        exit "${TS_UP_EXIT}"
                    fi
                else
                    exit "${TS_UP_EXIT}"
                fi
            fi
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
