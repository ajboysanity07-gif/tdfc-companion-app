#!/bin/bash
set -e

# Start Tailscale daemon
echo "Starting Tailscale..."
tailscaled --tun=userspace-networking &
TAILSCALED_PID=$!

# Wait for Tailscale to start
sleep 2

# Use a fixed hostname so re-deployments replace the old machine instead of creating new ones
HOSTNAME="tdfc-railway"

# Connect to Tailscale if not already connected
if ! tailscale status >/dev/null 2>&1; then
    echo "Connecting to Tailscale with hostname: ${HOSTNAME}"
    tailscale up --authkey="${TAILSCALE_AUTHKEY}" --hostname="${HOSTNAME}" || true
fi

# Execute next command
exec "$@"
