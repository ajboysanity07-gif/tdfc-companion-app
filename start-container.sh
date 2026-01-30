#!/bin/bash
set -e

# Wait for Tailscale to connect
for i in {1..30}; do
    if tailscale status | grep -q "100\."; then
        echo "Tailscale connected"
        break
    fi
    sleep 1
done

# Start PHP-FPM
echo "Starting PHP-FPM..."
php-fpm -D

# Start nginx in foreground
echo "Starting nginx..."
exec nginx -g "daemon off;"
