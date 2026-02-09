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
TS_WATCHDOG_INTERVAL="${TS_WATCHDOG_INTERVAL:-20}"
TS_DB_PROXY_PID_FILE="${TS_DB_PROXY_PID_FILE:-${TS_STATE_DIR}/db-proxy.pid}"
TS_DB_PROXY_LOCK_DIR="${TS_DB_PROXY_LOCK_DIR:-${TS_STATE_DIR}/db-proxy.lock}"
DB_HEALTHCHECK_INTERVAL="${DB_HEALTHCHECK_INTERVAL:-30}"
DB_HEALTHCHECK_ATTEMPT_TIMEOUT="${DB_HEALTHCHECK_ATTEMPT_TIMEOUT:-5}"
DB_WAIT_FOR_CONNECTION="${DB_WAIT_FOR_CONNECTION:-}"
DB_WAIT_MAX_RETRIES="${DB_WAIT_MAX_RETRIES:-12}"
DB_WAIT_SLEEP_SECONDS="${DB_WAIT_SLEEP_SECONDS:-2}"
DB_WAIT_ATTEMPT_TIMEOUT="${DB_WAIT_ATTEMPT_TIMEOUT:-15}"

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
TS_WATCHDOG_INTERVAL="$(strip_wrapping_quotes "${TS_WATCHDOG_INTERVAL}")"
TS_DB_PROXY_PID_FILE="$(strip_wrapping_quotes "${TS_DB_PROXY_PID_FILE}")"
TS_DB_PROXY_LOCK_DIR="$(strip_wrapping_quotes "${TS_DB_PROXY_LOCK_DIR}")"
DB_HEALTHCHECK_INTERVAL="$(strip_wrapping_quotes "${DB_HEALTHCHECK_INTERVAL}")"
DB_HEALTHCHECK_ATTEMPT_TIMEOUT="$(strip_wrapping_quotes "${DB_HEALTHCHECK_ATTEMPT_TIMEOUT}")"
DB_WAIT_FOR_CONNECTION="$(strip_wrapping_quotes "${DB_WAIT_FOR_CONNECTION}")"
DB_WAIT_MAX_RETRIES="$(strip_wrapping_quotes "${DB_WAIT_MAX_RETRIES}")"
DB_WAIT_SLEEP_SECONDS="$(strip_wrapping_quotes "${DB_WAIT_SLEEP_SECONDS}")"
DB_WAIT_ATTEMPT_TIMEOUT="$(strip_wrapping_quotes "${DB_WAIT_ATTEMPT_TIMEOUT}")"

TAILSCALED_PID=""
TS_DB_PROXY_PID=""

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

if [ -z "${DB_WAIT_FOR_CONNECTION}" ]; then
    if [ "${TS_DB_PROXY}" = "1" ] && [ -n "${DB_HOST:-}" ]; then
        DB_WAIT_FOR_CONNECTION="1"
    else
        DB_WAIT_FOR_CONNECTION="0"
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

ensure_tailscale_auth() {
    if [ -z "${TS_AUTHKEY}" ]; then
        return 0
    fi
    if [ ! -S "${TS_SOCKET}" ]; then
        return 0
    fi

    local ip
    ip="$(tailscale --socket="${TS_SOCKET}" ip -4 2>/dev/null | head -n 1 || true)"
    if [ -z "${ip}" ]; then
        echo "Tailscale IP missing; re-authenticating..."
        if tailscale_up; then
            wait_for_auth "${TS_AUTH_TIMEOUT}" || true
        fi
    fi
}

build_tailscale_up_args() {
    TS_UP_COMMON_ARGS=(--hostname="${TS_HOSTNAME}" --accept-dns="${TS_ACCEPT_DNS}")
    if [ -n "${TS_NETFILTER}" ]; then
        TS_UP_COMMON_ARGS+=(--netfilter-mode="${TS_NETFILTER}")
    else
        TS_UP_COMMON_ARGS+=(--netfilter-mode=off)
    fi

    TS_UP_ARGS=("${TS_UP_COMMON_ARGS[@]}")
    if [ -n "${TS_TAGS}" ]; then
        TS_UP_ARGS+=(--advertise-tags="${TS_TAGS}")
    fi
}

tailscale_up() {
    if [ -z "${TS_AUTHKEY}" ]; then
        echo "TS_AUTHKEY not set and no existing login detected. Cannot bring Tailscale up."
        return 1
    fi

    build_tailscale_up_args

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
                return "${TS_UP_EXIT}"
            fi
        else
            return "${TS_UP_EXIT}"
        fi
    fi

    return 0
}

start_tailscaled() {
    tailscaled "${TAILSCALED_ARGS[@]}" &
    TAILSCALED_PID=$!
}

acquire_db_proxy_lock() {
    if [ -z "${TS_DB_PROXY_LOCK_DIR}" ]; then
        return 0
    fi
    mkdir "${TS_DB_PROXY_LOCK_DIR}" 2>/dev/null
}

release_db_proxy_lock() {
    if [ -n "${TS_DB_PROXY_LOCK_DIR}" ]; then
        rmdir "${TS_DB_PROXY_LOCK_DIR}" 2>/dev/null || true
    fi
}

db_proxy_is_running() {
    if [ -n "${TS_DB_PROXY_PID_FILE}" ] && [ -f "${TS_DB_PROXY_PID_FILE}" ]; then
        local pid
        pid="$(cat "${TS_DB_PROXY_PID_FILE}" 2>/dev/null || true)"
        if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
            return 0
        fi
        rm -f "${TS_DB_PROXY_PID_FILE}" 2>/dev/null || true
    fi
    return 1
}

db_proxy_port_is_listening() {
    if [ -z "${TS_DB_LOCAL_PORT:-}" ]; then
        return 1
    fi
    if command -v ss >/dev/null 2>&1; then
        if ss -H -ltn "sport = :${TS_DB_LOCAL_PORT}" 2>/dev/null | grep -q .; then
            return 0
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -ltn 2>/dev/null | awk '{print $4}' | grep -q ":${TS_DB_LOCAL_PORT}$"; then
            return 0
        fi
    fi
    return 1
}

kill_db_proxy_by_port() {
    if [ -z "${TS_DB_LOCAL_PORT:-}" ]; then
        return 0
    fi
    if ! command -v ss >/dev/null 2>&1; then
        return 0
    fi

    local pids
    pids="$(ss -ltnp "sport = :${TS_DB_LOCAL_PORT}" 2>/dev/null | awk -F 'pid=' 'NR>1 {print $2}' | awk -F ',' '{print $1}')"
    if [ -n "${pids}" ]; then
        for pid in ${pids}; do
            kill "${pid}" 2>/dev/null || true
        done
    fi
}

start_db_proxy() {
    if [ -z "${TS_DB_REMOTE_HOST:-}" ]; then
        echo "TS_DB_PROXY enabled but DB_HOST is empty; skipping DB proxy."
        return 0
    fi
    if [ -z "${TS_DB_LOCAL_PORT}" ]; then
        TS_DB_LOCAL_PORT="${TS_DB_REMOTE_PORT:-1433}"
    fi
    if ! command -v ncat >/dev/null 2>&1; then
        echo "ncat not available; cannot start DB proxy."
        return 1
    fi

    if ! acquire_db_proxy_lock; then
        echo "DB proxy lock held; skipping restart."
        return 0
    fi
    trap 'release_db_proxy_lock' RETURN

    stop_db_proxy
    if db_proxy_port_is_listening; then
        echo "DB proxy port ${TS_DB_LOCAL_PORT} already in use; skipping restart."
        DB_HOST="127.0.0.1"
        DB_PORT="${TS_DB_LOCAL_PORT}"
        export DB_HOST DB_PORT
        return 0
    fi

    echo "Starting Tailscale DB proxy on 127.0.0.1:${TS_DB_LOCAL_PORT}..."
    ncat --listen 127.0.0.1 "${TS_DB_LOCAL_PORT}" --keep-open \
        --sh-exec "ncat --proxy ${TS_SOCKS5_HOST}:${TS_SOCKS5_PORT} --proxy-type socks5 ${TS_DB_REMOTE_HOST} ${TS_DB_REMOTE_PORT:-1433}" &
    TS_DB_PROXY_PID=$!
    if [ -n "${TS_DB_PROXY_PID_FILE}" ]; then
        echo "${TS_DB_PROXY_PID}" > "${TS_DB_PROXY_PID_FILE}" 2>/dev/null || true
    fi

    DB_HOST="127.0.0.1"
    DB_PORT="${TS_DB_LOCAL_PORT}"
    export DB_HOST DB_PORT
}

stop_db_proxy() {
    if [ -n "${TS_DB_PROXY_PID_FILE}" ] && [ -f "${TS_DB_PROXY_PID_FILE}" ]; then
        local pid
        pid="$(cat "${TS_DB_PROXY_PID_FILE}" 2>/dev/null || true)"
        if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
            kill "${pid}" 2>/dev/null || true
            wait "${pid}" 2>/dev/null || true
        fi
        rm -f "${TS_DB_PROXY_PID_FILE}" 2>/dev/null || true
    fi
    TS_DB_PROXY_PID=""
    kill_db_proxy_by_port
}

db_connection_check() {
    local attempt_timeout="${DB_HEALTHCHECK_ATTEMPT_TIMEOUT}"
    local timeout_cmd=()
    if command -v timeout >/dev/null 2>&1; then
        timeout_cmd=(timeout "${attempt_timeout}")
    fi

    set +e
    check_output="$("${timeout_cmd[@]}" gosu www-data php -r "
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
    " 2>&1)"
    check_exit=$?
    set -e

    if [ "${check_exit}" -eq 0 ]; then
        return 0
    fi

    echo "DB healthcheck failed (exit ${check_exit}): ${check_output}"
    return 1
}

start_db_healthcheck() {
    if [ "${DB_HEALTHCHECK_INTERVAL}" = "0" ]; then
        return 0
    fi
    if [ -z "${DB_HOST:-}" ]; then
        return 0
    fi

    (
        while true; do
            sleep "${DB_HEALTHCHECK_INTERVAL}"

            if ! db_connection_check; then
                echo "DB healthcheck failed; verifying Tailscale and DB proxy..."
                ensure_tailscale_auth
                if [ "${TS_DB_PROXY}" = "1" ]; then
                    start_db_proxy || true
                fi
            fi
        done
    ) &
}

start_tailscale_watchdog() {
    if [ "${TS_WATCHDOG_INTERVAL}" = "0" ]; then
        return 0
    fi

    (
        while true; do
            sleep "${TS_WATCHDOG_INTERVAL}"

            if [ -n "${TAILSCALED_PID:-}" ] && ! kill -0 "${TAILSCALED_PID}" 2>/dev/null; then
                echo "tailscaled stopped; restarting..."
                start_tailscaled
                if ! wait_for_localapi "${TS_READY_TIMEOUT}"; then
                    echo "Tailscaled did not become ready in time."
                    continue
                fi
            fi

            if [ -S "${TS_SOCKET}" ]; then
                local ip
                ip="$(tailscale --socket="${TS_SOCKET}" ip -4 2>/dev/null | head -n 1 || true)"
                if [ -z "${ip}" ] && [ -n "${TS_AUTHKEY}" ]; then
                    echo "Tailscale IP missing; re-authenticating..."
                    if tailscale_up; then
                        wait_for_auth "${TS_AUTH_TIMEOUT}" || true
                    fi
                fi
            fi

            if [ "${TS_DB_PROXY}" = "1" ]; then
                if ! db_proxy_is_running; then
                    echo "DB proxy stopped; restarting..."
                    start_db_proxy || true
                fi
            fi
        done
    ) &
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
    if [ -n "${TS_DB_PROXY_LOCK_DIR}" ]; then
        rm -rf "${TS_DB_PROXY_LOCK_DIR}" 2>/dev/null || true
    fi
    if [ -n "${TS_DB_PROXY_PID_FILE}" ]; then
        rm -f "${TS_DB_PROXY_PID_FILE}" 2>/dev/null || true
    fi
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

    start_tailscaled

    if ! wait_for_localapi "${TS_READY_TIMEOUT}"; then
        echo "Tailscaled did not become ready in time."
        exit 1
    fi

    TS_IP="$(tailscale --socket="${TS_SOCKET}" ip -4 2>/dev/null | head -n 1 || true)"
    if [ -n "${TS_IP}" ]; then
        echo "Tailscale already authenticated with IP ${TS_IP}."
    else
        if ! tailscale_up; then
            exit 1
        fi

        if ! wait_for_auth "${TS_AUTH_TIMEOUT}"; then
            echo "Tailscale did not authenticate in time."
            tailscale --socket="${TS_SOCKET}" status || true
            exit 1
        fi
    fi

    if [ "${TS_DB_PROXY}" = "1" ]; then
        if [ -z "${DB_HOST:-}" ]; then
            echo "TS_DB_PROXY enabled but DB_HOST is empty; skipping DB proxy."
        else
            TS_DB_REMOTE_HOST="${DB_HOST}"
            TS_DB_REMOTE_PORT="${DB_PORT:-1433}"
            if ! start_db_proxy; then
                exit 1
            fi
        fi
    fi

    start_tailscale_watchdog
    start_db_healthcheck
fi

# Warmup database connection through Tailscale to reduce first-request latency
warmup_db_connection() {
    local strict="${1:-0}"
    echo "Warming up database connection..."
    local max_retries=5
    local sleep_seconds=2
    local retry=0
    local attempt_timeout="${DB_WARMUP_ATTEMPT_TIMEOUT:-15}"
    local timeout_cmd=()
    if [ "${strict}" = "1" ]; then
        max_retries="${DB_WAIT_MAX_RETRIES}"
        sleep_seconds="${DB_WAIT_SLEEP_SECONDS}"
        attempt_timeout="${DB_WAIT_ATTEMPT_TIMEOUT}"
    fi
    if command -v timeout >/dev/null 2>&1; then
        timeout_cmd=(timeout "${attempt_timeout}")
    fi
    while [ $retry -lt $max_retries ]; do
        # Use a simple PHP script instead of tinker to avoid psysh config issues
        set +e
        warmup_output="$("${timeout_cmd[@]}" gosu www-data php -r "
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
        " 2>&1)"
        warmup_exit=$?
        set -e

        if [ "${warmup_exit}" -eq 0 ]; then
            echo ""
            echo "${warmup_output}"
            echo "Database connection warmed up successfully."
            return 0
        fi

        retry=$((retry + 1))
        echo ""
        echo "Database warmup attempt $retry/$max_retries failed (exit ${warmup_exit}): ${warmup_output}"
        echo "Retrying in ${sleep_seconds}s..."
        sleep "${sleep_seconds}"
    done
    if [ "${strict}" = "1" ]; then
        echo "ERROR: Database wait failed after $max_retries attempts."
        return 1
    fi
    echo "WARNING: Database warmup failed after $max_retries attempts. First requests may be slow."
    return 0
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

# Ensure DB is reachable before serving traffic when enabled
if [ "${DB_WAIT_FOR_CONNECTION}" = "1" ] && [ -n "${DB_HOST:-}" ]; then
    if ! warmup_db_connection 1; then
        exit 1
    fi
fi

# Warmup DB connection if we're using the DB proxy
case "${RUN_MIGRATIONS:-}" in
    1|true|TRUE|yes|YES)
        echo "Running migrations..."
        gosu www-data php artisan migrate --force
        ;;
esac

php-fpm -D
if [ "${DB_WAIT_FOR_CONNECTION}" != "1" ] && { [ "${TS_DB_PROXY:-0}" = "1" ] || [ -n "${DB_HOST:-}" ]; }; then
    echo "Starting database warmup in background..."
    warmup_db_connection &
fi
exec gosu www-data nginx -g "daemon off;"
