#!/bin/bash

# Wait for Tailscale to connect
echo "Waiting for Tailscale network..."
for i in {1..30}; do
    if tailscale status | grep -q "100\."; then
        echo "Tailscale connected"
        break
    fi
    sleep 1
done

# Start PHP-FPM
php-fpm -D

# Start nginx
nginx -g "daemon off;"
