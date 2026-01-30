#!/bin/bash
set -e

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

# Create PHP-FPM runtime directory with proper permissions
echo "Setting up PHP-FPM socket directory..."
mkdir -p /run/php
chmod 777 /run/php
chown www-data:www-data /run/php

# Start PHP-FPM
echo "Starting PHP-FPM..."
php-fpm -D

# Give PHP-FPM time to create the socket and set permissions
sleep 2

# Ensure socket has proper permissions
if [ -S /run/php-fpm.sock ]; then
    chmod 666 /run/php-fpm.sock
    echo "PHP-FPM socket ready at /run/php-fpm.sock"
fi

# Test nginx configuration before starting
echo "Testing nginx configuration..."
if ! nginx -t 2>&1; then
    echo "ERROR: nginx configuration test failed!"
    nginx -t
    exit 1
fi

# Start nginx in foreground
echo "Starting nginx..."
exec nginx -g "daemon off;"
