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
TS_ACCEPT_DNS="${TS_ACCEPT_DNS:-false}"
TS_READY_TIMEOUT="${TS_READY_TIMEOUT:-60}"
TS_AUTH_TIMEOUT="${TS_AUTH_TIMEOUT:-60}"
TS_DB_PROXY="${TS_DB_PROXY:-auto}"
TS_DB_LOCAL_PORT="${TS_DB_LOCAL_PORT:-}"
TS_SOCKS5_HOST="${TS_SOCKS5_HOST:-}"
TS_SOCKS5_PORT="${TS_SOCKS5_PORT:-}"

cd "${APP_DIR}"

strip_wrapping_quotes() {
    local value="$1"
    if [ -n "${value}" ]; then
        if [ "${value:0:1}" = "\"" ] && [ "${value: -1}" = "\"" ]; then
            value="${value:1:${#value}-2}"
        elif [ "${value:0:1}" = "'" ] && [ "${value: -1}" = "'" ]; then
            value="${value:1:${#value}-2}"
        fi
    fi
    printf '%s' "${value}"
}

sanitize_hostname() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9-]+/-/g; s/^-+//; s/-+$//; s/-{2,}/-/g'
}

truncate_hostname() {
    echo "$1" | cut -c1-63
}

is_tailscale_ip() {
    local host="$1"
    case "$host" in
        100.*)
            local second="${host#100.}"
            second="${second%%.*}"
            case "$second" in
                ''|*[!0-9]*) return 1 ;;
            esac
            if [ "$second" -ge 64 ] && [ "$second" -le 127 ]; then
                return 0
            fi
            ;;
    esac
    return 1
}

TS_HOSTNAME="$(strip_wrapping_quotes "${TS_HOSTNAME}")"
TS_TAGS="$(strip_wrapping_quotes "${TS_TAGS}")"
TS_AUTHKEY="$(strip_wrapping_quotes "${TS_AUTHKEY}")"
TS_TUN="$(strip_wrapping_quotes "${TS_TUN}")"
TS_NETFILTER="$(strip_wrapping_quotes "${TS_NETFILTER}")"
TS_ACCEPT_DNS="$(strip_wrapping_quotes "${TS_ACCEPT_DNS}")"
TS_READY_TIMEOUT="$(strip_wrapping_quotes "${TS_READY_TIMEOUT}")"
TS_AUTH_TIMEOUT="$(strip_wrapping_quotes "${TS_AUTH_TIMEOUT}")"
TS_DB_PROXY="$(strip_wrapping_quotes "${TS_DB_PROXY}")"
TS_DB_LOCAL_PORT="$(strip_wrapping_quotes "${TS_DB_LOCAL_PORT}")"
TS_SOCKS5_HOST="$(strip_wrapping_quotes "${TS_SOCKS5_HOST}")"
TS_SOCKS5_PORT="$(strip_wrapping_quotes "${TS_SOCKS5_PORT}")"

if [ -n "${DB_HOST:-}" ]; then
    export DB_HOST
    DB_HOST="$(strip_wrapping_quotes "${DB_HOST}")"
fi
if [ -n "${DB_PORT:-}" ]; then
    export DB_PORT
    DB_PORT="$(strip_wrapping_quotes "${DB_PORT}")"
fi
if [ -n "${DB_DATABASE:-}" ]; then
    export DB_DATABASE
    DB_DATABASE="$(strip_wrapping_quotes "${DB_DATABASE}")"
fi
if [ -n "${DB_USERNAME:-}" ]; then
    export DB_USERNAME
    DB_USERNAME="$(strip_wrapping_quotes "${DB_USERNAME}")"
fi
if [ -n "${DB_PASSWORD:-}" ]; then
    export DB_PASSWORD
    DB_PASSWORD="$(strip_wrapping_quotes "${DB_PASSWORD}")"
fi
if [ -n "${DB_CONNECTION:-}" ]; then
    export DB_CONNECTION
    DB_CONNECTION="$(strip_wrapping_quotes "${DB_CONNECTION}")"
fi

if [ -z "${TS_DB_PROXY}" ] || [ "${TS_DB_PROXY}" = "auto" ]; then
    if [ -n "${DB_HOST:-}" ] && is_tailscale_ip "${DB_HOST}"; then
        TS_DB_PROXY="1"
    else
        TS_DB_PROXY="0"
    fi
fi

if [ "${TS_DB_PROXY}" = "1" ]; then
    if [ -z "${TS_SOCKS5_HOST}" ]; then
        TS_SOCKS5_HOST="127.0.0.1"
    fi
    if [ -z "${TS_SOCKS5_PORT}" ]; then
        TS_SOCKS5_PORT="1055"
    fi
fi

wait_for_localapi() {
    local retries="$1"
    for i in $(seq 1 "${retries}"); do
        if [ -S "${TS_SOCKET}" ]; then
            local status_json
            status_json="$(tailscale --socket="${TS_SOCKET}" status --json 2>&1 || true)"
            if echo "${status_json}" | grep -q '"BackendState"' || echo "${status_json}" | grep -qi "Tailscale is stopped"; then
                return 0
            fi
        fi
        sleep 1
    done
    return 1
}

wait_for_auth() {
    local retries="$1"
    for i in $(seq 1 "${retries}"); do
        local ip
        ip="$(tailscale --socket="${TS_SOCKET}" ip -4 2>/dev/null | head -n 1 || true)"
        if [ -n "${ip}" ]; then
            echo "Tailscale authenticated with IP ${ip}."
            return 0
        fi
        sleep 1
    done
    return 1
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
TS_HOSTNAME="$(truncate_hostname "${TS_HOSTNAME}")"
if [ -z "${TS_HOSTNAME_ORIG}" ]; then
    echo "TS_HOSTNAME not set; using derived hostname: ${TS_HOSTNAME}"
fi
if [ -n "${TS_TUN}" ] && [ "${TS_TUN}" != "userspace" ]; then
    echo "Ignoring TS_TUN=${TS_TUN}; Railway Hobbyist requires userspace networking."
fi
if [ "${TS_ACCEPT_DNS}" != "false" ]; then
    echo "Ignoring TS_ACCEPT_DNS=${TS_ACCEPT_DNS}; Railway Hobbyist uses accept-dns=false."
    TS_ACCEPT_DNS="false"
fi

# Ensure Laravel runtime directories exist and are writable
mkdir -p \
    "${APP_DIR}/storage/framework/sessions" \
    "${APP_DIR}/storage/framework/cache" \
    "${APP_DIR}/storage/framework/cache/data" \
    "${APP_DIR}/storage/framework/views" \
    "${APP_DIR}/storage/logs" \
    "${APP_DIR}/bootstrap/cache"
chown -R www-data:www-data "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache"

# Render nginx config with runtime PORT
export PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Ensure nginx temp directories are writable
mkdir -p /tmp/nginx/client_body /tmp/nginx/proxy /tmp/nginx/fastcgi /tmp/nginx/uwsgi /tmp/nginx/scgi
mkdir -p /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi /var/lib/nginx/uwsgi /var/lib/nginx/scgi
chown -R www-data:www-data /tmp/nginx /var/lib/nginx

if [ "${TS_DISABLE:-}" != "1" ]; then
    echo "Starting tailscaled..."
    TS_SOCKET_DIR="$(dirname "${TS_SOCKET}")"
    mkdir -p "${TS_STATE_DIR}" "${TS_SOCKET_DIR}"
    chown -R root:root "${TS_STATE_DIR}" "${TS_SOCKET_DIR}" 2>/dev/null || true
    chmod 700 "${TS_STATE_DIR}" 2>/dev/null || true
    chmod 755 "${TS_SOCKET_DIR}" 2>/dev/null || true

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
    if [ -n "${TS_SOCKS5_HOST}" ] && [ -n "${TS_SOCKS5_PORT}" ]; then
        TAILSCALED_ARGS+=(--socks5-server="${TS_SOCKS5_HOST}:${TS_SOCKS5_PORT}")
    fi

    tailscaled "${TAILSCALED_ARGS[@]}" &

    if ! wait_for_localapi "${TS_READY_TIMEOUT}"; then
        echo "Tailscaled did not become ready in time."
        exit 1
    fi

    TS_IP="$(tailscale --socket="${TS_SOCKET}" ip -4 2>/dev/null | head -n 1 || true)"
    if [ -n "${TS_IP}" ]; then
        echo "Tailscale already authenticated with IP ${TS_IP}."
    else
        if [ -z "${TS_AUTHKEY}" ]; then
            echo "TS_AUTHKEY not set and no existing login detected. Cannot bring Tailscale up."
            exit 1
        else
            TS_UP_COMMON_ARGS=()
            TS_UP_COMMON_ARGS+=(--hostname="${TS_HOSTNAME}")
            TS_UP_COMMON_ARGS+=(--accept-dns="${TS_ACCEPT_DNS}")
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

            if ! wait_for_auth "${TS_AUTH_TIMEOUT}"; then
                echo "Tailscale did not authenticate in time."
                tailscale --socket="${TS_SOCKET}" status || true
                exit 1
            fi
        fi
    fi

    if [ "${TS_DB_PROXY}" = "1" ]; then
        if [ -z "${DB_HOST:-}" ]; then
            echo "TS_DB_PROXY enabled but DB_HOST is empty; skipping DB proxy."
        else
            TS_DB_REMOTE_HOST="${DB_HOST}"
            TS_DB_REMOTE_PORT="${DB_PORT:-1433}"
            if [ -z "${TS_DB_LOCAL_PORT}" ]; then
                TS_DB_LOCAL_PORT="${TS_DB_REMOTE_PORT}"
            fi

            if ! command -v ncat >/dev/null 2>&1; then
                echo "ncat not available; cannot start DB proxy."
                exit 1
            fi

            echo "Starting Tailscale DB proxy on 127.0.0.1:${TS_DB_LOCAL_PORT}..."
            ncat --listen 127.0.0.1 "${TS_DB_LOCAL_PORT}" --keep-open \
                --sh-exec "ncat --proxy ${TS_SOCKS5_HOST}:${TS_SOCKS5_PORT} --proxy-type socks5 ${TS_DB_REMOTE_HOST} ${TS_DB_REMOTE_PORT}" &

            DB_HOST="127.0.0.1"
            DB_PORT="${TS_DB_LOCAL_PORT}"
            export DB_HOST DB_PORT
        fi
    fi
fi

# Warmup database connection through Tailscale to reduce first-request latency
warmup_db_connection() {
    echo "Warming up database connection..."
    local max_retries=5
    local retry=0
    local attempt_timeout="${DB_WARMUP_ATTEMPT_TIMEOUT:-15}"
    local timeout_cmd=()
    if command -v timeout >/dev/null 2>&1; then
        timeout_cmd=(timeout "${attempt_timeout}")
    fi
    while [ $retry -lt $max_retries ]; do
        # Use a simple PHP script instead of tinker to avoid psysh config issues
        if "${timeout_cmd[@]}" gosu www-data php -r "
            require '/var/www/html/vendor/autoload.php';
            \$app = require_once '/var/www/html/bootstrap/app.php';
            \$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
            \$kernel->bootstrap();
            try {
                \Illuminate\Support\Facades\DB::connection()->getPdo();
                echo 'DB connection established';
                exit(0);
            } catch (Exception \$e) {
                echo 'Failed: ' . \$e->getMessage();
                exit(1);
            }
        " 2>&1; then
            echo ""
            echo "Database connection warmed up successfully."
            return 0
        fi
        retry=$((retry + 1))
        echo ""
        echo "Database warmup attempt $retry/$max_retries failed, retrying in 2s..."
        sleep 2
    done
    echo "WARNING: Database warmup failed after $max_retries attempts. First requests may be slow."
    return 0  # Don't fail startup, just warn
}

gosu www-data php artisan config:cache
if [ -f "${APP_DIR}/config/view.php" ]; then
    if [ -d "${APP_DIR}/resources/views" ]; then
        if [ -n "$(find "${APP_DIR}/resources/views" -type f -name '*.blade.php' -print -quit 2>/dev/null)" ]; then
            if ! gosu www-data php artisan view:cache; then
                echo "view:cache failed; continuing."
            fi
        else
            echo "No Blade views found; skipping view:cache."
        fi
    else
        echo "Views directory not found; skipping view:cache."
    fi
else
    echo "View config not found; skipping view:cache."
fi

# Warmup DB connection if we're using the DB proxy
case "${RUN_MIGRATIONS:-}" in
    1|true|TRUE|yes|YES)
        echo "Running migrations..."
        gosu www-data php artisan migrate --force
        ;;
esac

php-fpm -D
if [ "${TS_DB_PROXY:-0}" = "1" ] || [ -n "${DB_HOST:-}" ]; then
    echo "Starting database warmup in background..."
    warmup_db_connection &
fi
exec gosu www-data nginx -g "daemon off;"
