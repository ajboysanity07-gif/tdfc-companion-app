#!/bin/bash
set -e

# Start Tailscale in background with userspace networking
echo "Starting Tailscale..."
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &

# Wait for tailscaled to be ready
sleep 2

# Connect using auth key
if [ -z "$TAILSCALE_AUTH_KEY" ]; then
    echo "ERROR: TAILSCALE_AUTH_KEY not set"
    exit 1
fi

echo "Connecting to Tailscale network..."
# Note: Do NOT use --ephemeral flag as it will cause the device to disconnect on container restart
# Use a reusable, non-ephemeral auth key instead
tailscale up \
    --authkey="$TAILSCALE_AUTH_KEY" \
    --hostname=railway-laravel \
    --accept-routes \
    --accept-dns=false

# Wait for Tailscale to connect
echo "Waiting for Tailscale to connect..."
for i in {1..30}; do
    if tailscale status | grep -q "100\."; then
        TAILSCALE_IP=$(tailscale ip -4)
        echo "✓ Connected to Tailscale! IP: $TAILSCALE_IP"
        break
    fi
    sleep 1
done

# Now start the main container script
echo "Starting Laravel application..."
exec /usr/local/bin/start-container
