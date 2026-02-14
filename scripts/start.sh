#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/html"
PORT="${PORT:-8080}"

PHP_FPM_BIN="${PHP_FPM_BIN:-php-fpm}"
PHP_FPM_PID_FILE="${PHP_FPM_PID_FILE:-/usr/local/var/run/php-fpm.pid}"

# Persist tailscale state by default so we reuse the same machine identity across deploys.
TS_STATE_DIR="${TS_STATE_DIR:-/var/lib/tailscale}"
TS_SOCKET="${TS_SOCKET:-${TS_STATE_DIR}/socket}"
TS_AUTHKEY="${TS_AUTHKEY:-}"
TS_HOSTNAME="${TS_HOSTNAME:-railway-app}"
TS_TAGS="${TS_TAGS:-}"
TS_SOCKS5_HOST="127.0.0.1"
TS_SOCKS5_PORT="${TS_SOCKS5_PORT:-1055}"

TAILNET_DB_HOST="${TAILNET_DB_HOST:-}"
TAILNET_DB_PORT="${TAILNET_DB_PORT:-1433}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-11433}"

SSR_HOST="${SSR_HOST:-127.0.0.1}"
SSR_PORT="${SSR_PORT:-13714}"
INERTIA_SSR_ENABLED_RAW="${INERTIA_SSR_ENABLED:-false}"
INERTIA_SSR_URL="${INERTIA_SSR_URL:-}"

TAILSCALED_PID=""
DB_PROXY_PID=""
SSR_PID=""

log() {
    echo "[start] $*"
}

warn() {
    echo "[start][warn] $*" >&2
}

is_truthy() {
    case "$(echo "${1}" | tr '[:upper:]' '[:lower:]')" in
        1 | true | yes | on) return 0 ;;
        *) return 1 ;;
    esac
}

require_app_key() {
    if [ -z "${APP_KEY:-}" ]; then
        warn "APP_KEY is required (generate locally; do not generate at runtime)."
        exit 1
    fi
}

set_app_defaults() {
    export APP_ENV="${APP_ENV:-production}"
    export APP_DEBUG="${APP_DEBUG:-false}"
    export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"
}

prepare_directories() {
    mkdir -p \
        "${APP_DIR}/storage/framework/sessions" \
        "${APP_DIR}/storage/framework/cache" \
        "${APP_DIR}/storage/framework/cache/data" \
        "${APP_DIR}/storage/framework/views" \
        "${APP_DIR}/storage/logs" \
        "${APP_DIR}/bootstrap/cache" \
        "${TS_STATE_DIR}" \
        "$(dirname "${TS_SOCKET}")" \
        /tmp/nginx/client_body /tmp/nginx/proxy /tmp/nginx/fastcgi /tmp/nginx/uwsgi /tmp/nginx/scgi \
        /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi /var/lib/nginx/uwsgi /var/lib/nginx/scgi

    chown -R www-data:www-data "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache"
    chown -R www-data:www-data /tmp/nginx /var/lib/nginx
}

render_nginx_config() {
    export PORT
    envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
}

wait_for_tailscale_socket() {
    for _ in $(seq 1 30); do
        if [ -S "${TS_SOCKET}" ]; then
            return 0
        fi
        sleep 1
    done

    return 1
}

wait_for_tailscale_login() {
    for _ in $(seq 1 30); do
        status_output="$(tailscale --socket="${TS_SOCKET}" status --peers=false 2>/dev/null || true)"
        if echo "${status_output}" | grep -qi 'logged in'; then
            return 0
        fi
        sleep 1
    done

    return 1
}

check_tcp() {
    local host="${1}"
    local port="${2}"
    local timeout_seconds="${3:-2}"

    if ! timeout "${timeout_seconds}" bash -c "cat < /dev/null > /dev/tcp/${host}/${port}" >/dev/null 2>&1; then
        return 1
    fi

    return 0
}

wait_for_tcp() {
    local host="${1}"
    local port="${2}"
    local attempts="${3:-30}"
    local delay="${4:-2}"

    for _ in $(seq 1 "${attempts}"); do
        if check_tcp "${host}" "${port}"; then
            return 0
        fi
        sleep "${delay}"
    done

    return 1
}

start_tailscale() {
    if [ -z "${TS_AUTHKEY}" ]; then
        warn "TS_AUTHKEY not set; refusing to start without Tailscale."
        return 1
    fi

    log "Starting tailscaled (userspace networking)..."
    tailscaled --tun=userspace-networking --state="${TS_STATE_DIR}/state" --socket="${TS_SOCKET}" --socks5-server="${TS_SOCKS5_HOST}:${TS_SOCKS5_PORT}" &
    TAILSCALED_PID=$!

    if ! wait_for_tailscale_socket; then
        warn "tailscaled socket not ready in time."
        return 1
    fi

    log "Bringing Tailscale up as ${TS_HOSTNAME}..."
    tailscale_args=(
        --authkey="${TS_AUTHKEY}"
        --hostname="${TS_HOSTNAME}"
        --accept-routes=false
        --accept-dns=true
    )

    if [ -n "${TS_TAGS}" ]; then
        tailscale_args+=(--advertise-tags="${TS_TAGS}")
    fi

    if ! tailscale --socket="${TS_SOCKET}" up "${tailscale_args[@]}"; then
        warn "tailscale up failed; aborting startup."
        return 1
    fi

    if ! wait_for_tailscale_login; then
        warn "Tailscale did not report a logged-in state; aborting startup."
        return 1
    fi

    ts_ip="$(tailscale --socket="${TS_SOCKET}" ip -4 2>/dev/null | head -n 1 || true)"
    if [ -n "${ts_ip}" ]; then
        log "Tailscale is up with IP ${ts_ip}."
    fi

    return 0
}

rewrite_db_url() {
    local var_name="$1"
    local value="${!var_name:-}"

    if [ -z "${value}" ]; then
        return
    fi

    local rewritten
    rewritten="$(DB_URL_VALUE="${value}" NEW_HOST="127.0.0.1" NEW_PORT="${LOCAL_DB_PORT}" php -r "
        \$value = getenv('DB_URL_VALUE');
        \$host = getenv('NEW_HOST');
        \$port = getenv('NEW_PORT');
        if (!\$value || !\$host) {
            exit(0);
        }
        \$parts = parse_url(\$value);
        if (\$parts === false || !isset(\$parts['scheme'])) {
            exit(0);
        }
        \$scheme = \$parts['scheme'];
        \$user = \$parts['user'] ?? '';
        \$pass = \$parts['pass'] ?? '';
        \$path = \$parts['path'] ?? '';
        \$query = \$parts['query'] ?? '';
        \$auth = \$user !== '' ? \$user.(\$pass !== '' ? ':'.\$pass : '').'@' : '';
        \$port = \$port !== '' ? ':'.\$port : (isset(\$parts['port']) ? ':'.\$parts['port'] : '');
        \$url = \$scheme.'://'.\$auth.\$host.\$port.\$path;
        if (\$query !== '') {
            \$url .= '?'.\$query;
        }
        echo \$url;
    ")"

    if [ -n "${rewritten}" ]; then
        export "${var_name}=${rewritten}"
    fi
}

start_db_proxy() {
    if [ -z "${TAILNET_DB_HOST}" ]; then
        warn "TAILNET_DB_HOST not set; skipping DB forwarding."
        return
    fi

    log "Forwarding ${TAILNET_DB_HOST}:${TAILNET_DB_PORT} to 127.0.0.1:${LOCAL_DB_PORT} via Tailscale SOCKS."
    socat "TCP-LISTEN:${LOCAL_DB_PORT},fork,reuseaddr" "SOCKS4A:${TS_SOCKS5_HOST}:${TAILNET_DB_HOST}:${TAILNET_DB_PORT},socksport=${TS_SOCKS5_PORT}" &
    DB_PROXY_PID=$!

    export DB_CONNECTION="sqlsrv"
    export DB_HOST="127.0.0.1"
    export DB_PORT="${LOCAL_DB_PORT}"

    rewrite_db_url "DB_URL"
    rewrite_db_url "DATABASE_URL"
}

wait_for_tailnet_db() {
    if [ -z "${TAILNET_DB_HOST}" ]; then
        return
    fi

    log "Waiting for tailnet DB ${TAILNET_DB_HOST}:${TAILNET_DB_PORT} to become reachable..."
    if wait_for_tcp "${TAILNET_DB_HOST}" "${TAILNET_DB_PORT}" 30 2; then
        log "Tailnet DB is reachable."
    else
        warn "Tailnet DB not reachable after waiting; aborting startup."
        return 1
    fi
}

cache_config() {
    gosu www-data php artisan config:cache

    if [ -d "${APP_DIR}/resources/views" ]; then
        gosu www-data php artisan view:cache || warn "view:cache failed; continuing without cached views."
    fi
}

run_migrations() {
    case "${RUN_MIGRATIONS:-0}" in
        1 | true | TRUE | yes | YES)
            log "Running migrations..."
            gosu www-data php artisan migrate --force
            ;;
    esac
}

start_ssr() {
    if ! is_truthy "${INERTIA_SSR_ENABLED_RAW}"; then
        log "SSR disabled (INERTIA_SSR_ENABLED=false)."
        return
    fi

    if [ -z "${INERTIA_SSR_URL}" ]; then
        export INERTIA_SSR_URL="http://${SSR_HOST}:${SSR_PORT}"
    fi

    log "Starting Inertia SSR server at ${SSR_HOST}:${SSR_PORT}..."
    gosu www-data php artisan inertia:start-ssr --host="${SSR_HOST}" --port="${SSR_PORT}" &
    SSR_PID=$!
}

cleanup() {
    if [ -n "${SSR_PID}" ]; then
        kill "${SSR_PID}" 2>/dev/null || true
    fi

    if [ -n "${DB_PROXY_PID}" ]; then
        kill "${DB_PROXY_PID}" 2>/dev/null || true
    fi

    if [ -n "${TAILSCALED_PID}" ]; then
        kill "${TAILSCALED_PID}" 2>/dev/null || true
    fi
}

trap cleanup EXIT

cd "${APP_DIR}"

set_app_defaults
require_app_key
prepare_directories
render_nginx_config

TAILSCALE_READY=0
if start_tailscale; then
    TAILSCALE_READY=1
    if ! wait_for_tailnet_db; then
        exit 1
    fi
    start_db_proxy
else
    warn "Tailscale failed to start; aborting."
    exit 1
fi

cache_config
run_migrations
start_ssr

"${PHP_FPM_BIN}" -D

exec nginx -g "daemon off;"
