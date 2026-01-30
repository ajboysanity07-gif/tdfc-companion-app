#!/bin/bash
set -e

# Start Tailscale daemon
echo "Starting Tailscale..."
tailscaled --tun=userspace-networking &
TAILSCALED_PID=$!

# Wait for Tailscale to start
sleep 2

# Connect to Tailscale if not already connected
if ! tailscale status >/dev/null 2>&1; then
    echo "Connecting to Tailscale..."
    tailscale up --authkey="${TAILSCALE_AUTHKEY}" || true
fi

# Execute next command
exec "$@"
