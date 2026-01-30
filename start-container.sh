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

# Create PHP-FPM runtime directory
mkdir -p /run/php
chown www-data:www-data /run/php

# Start PHP-FPM
echo "Starting PHP-FPM..."
php-fpm -D

# Give PHP-FPM a moment to create the socket
sleep 1

# Start nginx in foreground
echo "Starting nginx..."
nginx -g "daemon off;"
