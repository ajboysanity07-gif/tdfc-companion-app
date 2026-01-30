#!/bin/bash

# Wait for Tailscale to connect
for i in {1..30}; do
    if tailscale status | grep -q "100\."; then
        break
    fi
    sleep 1
done

# Start PHP-FPM
php-fpm -D

# Start nginx
nginx -g "daemon off;"
