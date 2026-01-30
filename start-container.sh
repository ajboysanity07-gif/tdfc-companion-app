#!/bin/bash

# Wait for Tailscale to connect
echo "Waiting for Tailscale network..."
for i in {1..30}; do
    if tailscale status | grep -q "100\."; then
        echo "Tailscale connected"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done

# Start PHP-FPM
echo "Starting PHP-FPM..."
php-fpm -D

# Start nginx
echo "Starting nginx..."
nginx -g "daemon off;"
